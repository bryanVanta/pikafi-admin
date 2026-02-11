import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { ethers } from 'ethers';
import aiRoutes from './routes/ai';
import { getPool } from './db';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;



// Middleware
app.use(cors());
app.use(express.json());

// Routes
import assetsRouter from './routes/assets';
import aiRouter from './routes/ai';
import marketRouter from './routes/market';
import uploadRouter from './routes/upload';

app.use('/api/assets', assetsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/market', marketRouter);
app.use('/api/upload', uploadRouter);

// Swagger Configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Transaction Publisher API',
            version: '1.0.0',
            description: 'API for publishing and retrieving transactions locally',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Local server',
            },
        ],
    },
    apis: ['./src/index.ts'],
};



const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Blockchain Configuration
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

// Contract ABI (minimal for submitProposal and approveTransaction)
const contractABI = [
    "function submitProposal(address recipient, bytes data) external payable",
    "function approveTransaction(uint256 transactionId, address newRecipient, bytes newData) external payable",
    "event TransactionSubmitted(uint256 indexed transactionId, address indexed sender, address indexed recipient, uint256 amount, uint256 timestamp)",
    "event TransactionApproved(uint256 indexed transactionId, address indexed evaluator, address oldRecipient, uint256 oldAmount, address newRecipient, uint256 newAmount)"
];


const contract = new ethers.Contract(ethers.getAddress(process.env.CONTRACT_ADDRESS!), contractABI, wallet);
console.log("✅ Blockchain connection initialized");
console.log(`📝 Contract: ${process.env.CONTRACT_ADDRESS}`);
console.log(`🌐 Network: Arbitrum Sepolia (421614)`);
console.log("🔍 Contract methods:", Object.keys(contract));
try {
    console.log("🔍 submitProposal type:", typeof contract.submitProposal);
} catch (e) {
    console.log("❌ Error accessing submitProposal:", e);
}

// Helper function to record status change on blockchain
async function recordStatusOnBlockchain(gradingId: number, cardDetails: any, status: string, previousStatus: string | null = null): Promise<{ txHash: string; blockchainUid: number }> {
    try {
        // Encode card data as JSON
        // Filter card details to only show what is relevant
        const cleanCardDetails: any = {
            card_name: cardDetails.card_name,
            card_set: cardDetails.card_set,
            card_year: cardDetails.card_year,
            condition: cardDetails.condition
        };

        // Only include grades if they are present (cleaner view)
        if (cardDetails.grade) {
            cleanCardDetails.grade = cardDetails.grade;
            cleanCardDetails.grade_corners = cardDetails.grade_corners;
            cleanCardDetails.grade_edges = cardDetails.grade_edges;
            cleanCardDetails.grade_surface = cardDetails.grade_surface;
            cleanCardDetails.grade_centering = cardDetails.grade_centering;
        }

        const cardData = JSON.stringify({
            type: 'grading_status',
            grading_id: gradingId,
            card_details: cleanCardDetails,
            action: previousStatus ? `Status changed from ${previousStatus} to ${status}` : 'Initial Submission',
            timestamp: Date.now()
        }, null, 2); // Pretty print JSON

        // Convert to bytes
        const dataBytes = ethers.toUtf8Bytes(cardData);

        // Get checksummed address to avoid ENS lookup
        const recipientAddress = ethers.getAddress(process.env.CONTRACT_ADDRESS!);

        // Submit to blockchain (recipient is the contract itself for audit purposes)
        const tx = await contract.submitProposal(
            recipientAddress,
            dataBytes,
            { value: 0 } // No ETH transfer, just audit log
        );

        console.log(`⛓️ Blockchain transaction submitted: ${tx.hash}`);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

        // Use database ID as blockchain UID (contract doesn't expose transaction count)
        const blockchainUid = gradingId;

        return {
            txHash: tx.hash,
            blockchainUid
        };
    } catch (error) {
        console.error('❌ Blockchain recording failed:', error);
        throw error;
    }
}

// Health check endpoint


/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Submit a new transaction proposal (Dealer)
 */
app.post('/api/transactions', async (req: Request, res: Response) => {
    try {
        const { toAddress, amount, data } = req.body;

        if (!contract) {
            res.status(503).json({ success: false, message: "Blockchain unavailable" });
            return;
        }

        const txValue = amount ? ethers.parseEther(amount.toString()) : 0;
        const txData = data ? ethers.toUtf8Bytes(data) : "0x";

        console.log(`Submitting proposal to ${toAddress}...`);
        // CALL NEW FUNCTION: submitProposal
        const tx = await contract.submitProposal(toAddress, txData, { value: txValue });

        console.log(`Transaction sent: ${tx.hash}. Waiting for confirmation...`);
        const receipt = await tx.wait();

        res.json({
            success: true,
            hash: receipt.hash,
            message: 'Proposal submitted successfully (Pending Approval)',
            data: { toAddress, amount, data }
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/transactions/:id/approve:
 *   post:
 *     summary: Approve and modify a transaction (Evaluator)
 */
app.post('/api/transactions/:id/approve', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            newRecipient,
            newAmount,
            newData,
            // Extended Grading Fields
            card_name,
            card_set,
            card_year,
            condition,
            image_url,
            grade,
            grade_corners,
            grade_edges,
            grade_surface,
            grade_centering
        } = req.body;

        if (!contract) {
            res.status(503).json({ success: false, message: "Blockchain unavailable" });
            return;
        }

        try {
            const insertQuery = `
                INSERT INTO gradings (
                    uid, blockchain_uid, card_name, card_set, card_year, condition, 
                    image_url, grade, grade_corners, grade_edges, grade_surface, grade_centering,
                    status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Graded')
                RETURNING id;
            `;
            const values = [
                id, id, card_name, card_set, card_year, condition,
                image_url, grade, grade_corners, grade_edges, grade_surface, grade_centering
            ];

            await getPool().query(insertQuery, values);
            console.log(`✅ Saved grading metadata for Transaction #${id} to DB.`);
        } catch (dbError) {
            console.error("❌ DB Insert Failed:", dbError);
            res.status(500).json({ success: false, message: "Database insertion failed. Blockchain tx aborted." });
            return;
        }

        const txValue = newAmount ? ethers.parseEther(newAmount.toString()) : 0;

        const onChainData = JSON.stringify({
            status: "Graded",
            grade: grade,
            ref: "pikafi-db"
        });
        const txData = ethers.toUtf8Bytes(onChainData);

        console.log(`Approving transaction #${id}...`);
        const tx = await contract.approveTransaction(id, newRecipient, txData);

        console.log(`Approval sent: ${tx.hash}. Waiting...`);
        const receipt = await tx.wait();

        res.json({
            success: true,
            hash: receipt.hash,
            message: 'Transaction Approved and Graded!',
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/gradings:
 *   post:
 *     summary: Submit a new card for grading
 */
app.post('/api/gradings', async (req: Request, res: Response) => {
    try {
        const { card_name, card_set, card_year, condition, image_url } = req.body;

        if (!card_name) {
            return res.status(400).json({ success: false, message: 'Card name is required' });
        }

        // First, insert the grading record
        const insertQuery = `
            INSERT INTO gradings (
                card_name, card_set, card_year, condition, image_url, status
            ) VALUES ($1, $2, $3, $4, $5, 'Submitted')
            RETURNING *;
        `;

        const values = [card_name, card_set, card_year, condition, image_url];
        const result = await getPool().query(insertQuery, values);
        const insertedId = result.rows[0].id;

        // Record submission on blockchain
        let txHash = null;
        let blockchainUid = null;
        try {
            const blockchainResult = await recordStatusOnBlockchain(insertedId, { card_name, card_set, card_year, condition, image_url }, 'Submitted', null);
            txHash = blockchainResult.txHash;
            blockchainUid = blockchainResult.blockchainUid;
            console.log(`✅ Card ${insertedId} recorded on blockchain: ${txHash}`);
        } catch (blockchainError) {
            console.error('⚠️ Blockchain recording failed, continuing with database only:', blockchainError);
        }

        // Update the record with uid, tx_hash, and blockchain_uid
        await getPool().query(
            'UPDATE gradings SET uid = $1, tx_hash = $2, blockchain_uid = $3 WHERE id = $1',
            [insertedId, txHash, blockchainUid]
        );

        // Insert into status history
        await getPool().query(
            'INSERT INTO grading_status_history (grading_id, status, tx_hash) VALUES ($1, $2, $3)',
            [insertedId, 'Submitted', txHash]
        );

        // Fetch the updated record
        const updatedResult = await getPool().query('SELECT * FROM gradings WHERE id = $1', [insertedId]);

        res.json({
            success: true,
            grading: updatedResult.rows[0],
            message: 'Card submitted for grading successfully',
            blockchain: txHash ? { txHash, blockchainUid } : null
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/gradings:
 *   get:
 *     summary: Get all grading submissions
 */
app.get('/api/gradings', async (req: Request, res: Response) => {
    try {
        const result = await getPool().query(
            'SELECT * FROM gradings ORDER BY submitted_at DESC'
        );

        res.json({
            success: true,
            gradings: result.rows
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/gradings/:id/status:
 *   patch:
 *     summary: Update grading status and record on blockchain
 */
app.patch('/api/gradings/:id/status', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }

        // Get current grading
        const currentResult = await getPool().query('SELECT * FROM gradings WHERE id = $1', [id]);
        if (currentResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Grading not found' });
        }

        const grading = currentResult.rows[0];

        // Record status change on blockchain
        let txHash = null;
        let blockchainUid = null;
        try {
            // Pass full grading object for card details
            const blockchainResult = await recordStatusOnBlockchain(parseInt(id as string), grading, status, grading.status);
            txHash = blockchainResult.txHash;
            blockchainUid = blockchainResult.blockchainUid;
            console.log(`✅ Status update for card ${id} recorded on blockchain: ${txHash}`);
        } catch (blockchainError) {
            console.error('⚠️ Blockchain recording failed, continuing with database only:', blockchainError);
        }

        // Update status in database
        await getPool().query(
            'UPDATE gradings SET status = $1 WHERE id = $2',
            [status, id]
        );

        // Insert into status history
        await getPool().query(
            'INSERT INTO grading_status_history (grading_id, status, tx_hash) VALUES ($1, $2, $3)',
            [id, status, txHash]
        );

        // Fetch updated record
        const updatedResult = await getPool().query('SELECT * FROM gradings WHERE id = $1', [id]);

        res.json({
            success: true,
            grading: updatedResult.rows[0],
            message: 'Status updated successfully',
            blockchain: txHash ? { txHash, blockchainUid } : null
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/transactions/:uid/grading:
 *   get:
 *     summary: Get grading details from DB
 */
app.get('/api/transactions/:uid/grading', async (req: Request, res: Response) => {
    try {
        const { uid } = req.params;
        const result = await getPool().query(
            'SELECT * FROM gradings WHERE uid = $1',
            [uid]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, message: 'No grading details found' });
            return;
        }

        res.json({
            success: true,
            grading: result.rows[0]
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/transactions/:id/history:
 *   get:
 *     summary: Get transaction history (Audit Log)
 */
app.get('/api/transactions/:id/history', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!contract) {
            res.status(503).json({ success: false, message: "Blockchain unavailable" });
            return;
        }

        // Fetch events
        // Note: Filters depend on the indexed arguments in Solidity
        const submittedFilter = contract.filters.TransactionSubmitted(id);
        const approvedFilter = contract.filters.TransactionApproved(id);

        const [submittedEvents, approvedEvents] = await Promise.all([
            contract.queryFilter(submittedFilter),
            contract.queryFilter(approvedFilter)
        ]);

        const history = [];

        // Process Submitted Events
        for (const event of submittedEvents) {
            // Force type casting to any to access args safely
            const e = event as any;
            const block = await event.getBlock(); // get timestamp
            history.push({
                type: 'Submitted',
                hash: event.transactionHash,
                timestamp: block.timestamp,
                sender: e.args[1],
                recipient: e.args[2],
                amount: ethers.formatEther(e.args[3]),
                blockNumber: event.blockNumber
            });
        }

        // Process Approved Events
        for (const event of approvedEvents) {
            const e = event as any;
            const block = await event.getBlock();
            history.push({
                type: 'Approved',
                hash: event.transactionHash,
                timestamp: block.timestamp,
                approver: e.args[1],
                oldRecipient: e.args[2],
                oldAmount: ethers.formatEther(e.args[3]),
                newRecipient: e.args[4],
                newAmount: ethers.formatEther(e.args[5]),
                blockNumber: event.blockNumber
            });
        }

        // Sort by time
        history.sort((a, b) => a.timestamp - b.timestamp);

        res.json({
            success: true,
            history
        });

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});
/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all published transactions
 *     responses:
 *       200:
 *         description: List of transactions
 */
app.get('/api/transactions', async (req: Request, res: Response) => {
    try {
        if (!contract) {
            res.status(503).json({ success: false, message: "Blockchain unavailable" });
            return;
        }

        // Endpoint disabled due to contract limitations
        // const count = await contract.getTransactionCount();
        const transactions: any[] = [];

        // Fetch last 10 transactions (or fewer)
        // const fetchCount = Math.min(Number(count), 10);

        // for (let i = 0; i < fetchCount; i++) {
        // In a real app we might fetch in reverse order or use a multicall
        // const tx = await contract.getTransaction(i);
        // transactions.push({
        //     id: i,
        //     sender: tx.sender,
        //     recipient: tx.recipient,
        //     amount: ethers.formatEther(tx.amount),
        //     data: tx.data,
        //     timestamp: Number(tx.timestamp),
        //     status: Number(tx.status) // 0=Pending, 1=Approved, 2=Rejected
        // });
        // }

        res.json({
            success: true,
            count: 0,
            transactions: transactions
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(port, () => {
    console.log(`⚡️ Server is running at http://localhost:${port}`);
    console.log(`📄 Swagger UI available at http://localhost:${port}/api-docs`);
});

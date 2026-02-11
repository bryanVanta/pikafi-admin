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

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Contract Configuration
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";

// ABI (Updated for Approval Workflow)
const ABI = [
    "function submitProposal(address recipient, bytes calldata data) external payable",
    "function approveTransaction(uint256 transactionId, address newRecipient, bytes calldata newData) external payable",
    "function getTransactionCount() external view returns (uint256)",
    "function getTransaction(uint256 transactionId) external view returns (tuple(address sender, address recipient, uint256 amount, bytes data, uint256 timestamp, uint8 status))",
    "event TransactionSubmitted(uint256 indexed transactionId, address indexed sender, address indexed recipient, uint256 amount, uint256 timestamp)",
    "event TransactionApproved(uint256 indexed transactionId, address indexed evaluator, address oldRecipient, uint256 oldAmount, address newRecipient, uint256 newAmount)"
];

// Ethers Provider & Wallet
let wallet: ethers.Wallet;
let contract: ethers.Contract;

try {
    if (PRIVATE_KEY && CONTRACT_ADDRESS) {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
        console.log("Blockchain connection initialized.");
    } else {
        console.warn("Missing CONTRACT_ADDRESS or PRIVATE_KEY in .env. Blockchain features disabled.");
    }
} catch (error) {
    console.error("Failed to initialize blockchain connection:", error);
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

        if (!card_name || !image_url) {
            res.status(400).json({ success: false, message: 'Card name and image are required' });
            return;
        }

        const insertQuery = `
            INSERT INTO gradings (
                card_name, card_set, card_year, condition, image_url, status
            ) VALUES ($1, $2, $3, $4, $5, 'Submitted')
            RETURNING *;
        `;

        const values = [card_name, card_set, card_year, condition, image_url];
        const result = await getPool().query(insertQuery, values);

        // Update uid to match id
        const insertedId = result.rows[0].id;
        await getPool().query('UPDATE gradings SET uid = $1 WHERE id = $1', [insertedId]);

        // Fetch the updated record
        const updatedResult = await getPool().query('SELECT * FROM gradings WHERE id = $1', [insertedId]);

        res.json({
            success: true,
            grading: updatedResult.rows[0],
            message: 'Card submitted for grading successfully'
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

        const count = await contract.getTransactionCount();
        const transactions = [];

        // Fetch last 10 transactions (or fewer)
        const fetchCount = Math.min(Number(count), 10);

        for (let i = 0; i < fetchCount; i++) {
            // In a real app we might fetch in reverse order or use a multicall
            const tx = await contract.getTransaction(i);
            transactions.push({
                id: i,
                sender: tx.sender,
                recipient: tx.recipient,
                amount: ethers.formatEther(tx.amount),
                data: tx.data,
                timestamp: Number(tx.timestamp),
                status: Number(tx.status) // 0=Pending, 1=Approved, 2=Rejected
            });
        }

        res.json({
            success: true,
            count: Number(count),
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

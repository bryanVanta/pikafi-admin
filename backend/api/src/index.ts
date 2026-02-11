import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { ethers } from 'ethers';
import aiRoutes from './routes/ai';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// DB Check
import { getPool } from './db';
import { PoolClient } from 'pg';

getPool().connect().then((client: PoolClient) => {
    console.log('✅ Database connected successfully');
    client.release();
}).catch((err: Error) => {
    console.error('❌ Database connection failed:', err);
});

// Middleware
app.use(cors());
app.use(express.json()); // Restarted for Escrow Logic update

// Routes
import assetsRouter from './routes/assets';
import aiRouter from './routes/ai';
import marketRouter from './routes/market';

app.use('/api/assets', assetsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/market', marketRouter);

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
        const { newRecipient, newAmount, newData } = req.body;

        if (!contract) {
            res.status(503).json({ success: false, message: "Blockchain unavailable" });
            return;
        }

        const txValue = newAmount ? ethers.parseEther(newAmount.toString()) : 0;
        // logic note: usually we'd calculate diff, but here contract adds msg.value to existing amount.
        // For simplicity API assumes we send 0 extra ETH unless specified.

        const txData = newData ? ethers.toUtf8Bytes(newData) : "0x";

        console.log(`Approving transaction #${id}...`);
        const tx = await contract.approveTransaction(id, newRecipient, txData); // Value handling omitted for simple demo

        console.log(`Approval sent: ${tx.hash}. Waiting...`);
        const receipt = await tx.wait();

        res.json({
            success: true,
            hash: receipt.hash,
            message: 'Transaction Approved and On-Chain!',
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

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title TransactionPublisher
 * @dev Contract for publishing transactions with an Approval Workflow (Dealer -> Evaluator)
 */
contract TransactionPublisher {
    enum Status { Pending, Approved, Rejected }

    struct Transaction {
        address sender;
        address recipient;
        uint256 amount;
        bytes data;
        uint256 timestamp;
        Status status;
    }

    // Array to store all transactions
    Transaction[] public transactions;

    // Mapping from address to their transaction indices
    mapping(address => uint256[]) public senderTransactions;
    mapping(address => uint256[]) public recipientTransactions;

    // Events
    event TransactionSubmitted(
        uint256 indexed transactionId,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    event TransactionApproved(
        uint256 indexed transactionId,
        address indexed evaluator,
        address oldRecipient,
        uint256 oldAmount,
        address newRecipient,
        uint256 newAmount
    );

    /**
     * @dev Submit a new transaction proposal (Dealer)
     * @param recipient The recipient address
     * @param data Optional data to include with the transaction
     */
    function submitProposal(
        address recipient,
        bytes calldata data
    ) external payable {
        uint256 transactionId = transactions.length;

        Transaction memory newTransaction = Transaction({
            sender: msg.sender,
            recipient: recipient,
            amount: msg.value,
            data: data,
            timestamp: block.timestamp,
            status: Status.Pending
        });

        transactions.push(newTransaction);
        senderTransactions[msg.sender].push(transactionId);
        recipientTransactions[recipient].push(transactionId);

        emit TransactionSubmitted(
            transactionId,
            msg.sender,
            recipient,
            msg.value,
            block.timestamp
        );
    }

    /**
     * @dev Approve and Modify a transaction (Evaluator)
     * @param transactionId The ID of the transaction to approve
     * @param newRecipient New recipient address (can be same as old)
     * @param newData New data (can be same as old)
     */
    function approveTransaction(
        uint256 transactionId,
        address newRecipient,
        bytes calldata newData
    ) external payable {
        require(transactionId < transactions.length, "Transaction does not exist");
        Transaction storage txn = transactions[transactionId];
        require(txn.status == Status.Pending, "Transaction already finalized");

        // Track old values for history
        address oldRecipient = txn.recipient;
        uint256 oldAmount = txn.amount;

        // Decrease old amount from contract balance (conceptually) if we were handling internal accounting,
        // but here the ETH is already in the contract.
        // If the Evaluator sends *more* ETH, msg.value is added to the total.
        // For simplicity, we assume the Evaluator sends the *difference* or we just update the record
        // depending on how strictly we want to manage the ETH value.
        
        // For this demo: We update the struct fields. The ETH sent by Dealer stays in contract. 
        // If Evaluator wants to top up, they can send value.
        // We update the amount to be the NEW total amount (Old + any new Value sent by Evaluator).
        
        uint256 newAmount = txn.amount + msg.value;

        // Apply updates
        txn.recipient = newRecipient;
        txn.data = newData;
        txn.amount = newAmount;
        txn.status = Status.Approved;

        // Release Escrowed Funds to Recipient
        (bool success, ) = payable(newRecipient).call{value: newAmount}("");
        require(success, "Transfer failed");

        emit TransactionApproved(
            transactionId,
            msg.sender,
            oldRecipient,
            oldAmount,
            newRecipient,
            newAmount
        );
    }

    /**
     * @dev Get the total number of transactions
     */
    function getTransactionCount() external view returns (uint256) {
        return transactions.length;
    }

    /**
     * @dev Get a transaction by ID
     * @param transactionId The ID of the transaction
     */
    function getTransaction(
        uint256 transactionId
    ) external view returns (Transaction memory) {
        require(transactionId < transactions.length, "Transaction does not exist");
        return transactions[transactionId];
    }
}

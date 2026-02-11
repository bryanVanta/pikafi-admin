// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title PokemonMarketplace
 * @dev Simple marketplace contract for purchasing Pokemon cards with on-chain proof.
 */
contract PokemonMarketplace {
    
    event CardPurchased(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        string cardName,
        string cardGrade,
        string ipfsHash
    );

    event PaymentSent(address indexed to, uint256 amount);

    /**
     * @dev Buy a card from the marketplace.
     */
    function buyCard(
        uint256 listingId,
        address payable seller,
        string calldata cardName,
        string calldata cardGrade,
        string calldata ipfsHash
    ) external payable {
        require(msg.value > 0, "Price must be greater than zero");
        require(seller != address(0), "Invalid seller address");
        require(seller != msg.sender, "Cannot buy your own card");

        // Transfer funds to the seller using transfer for better revert handling
        seller.transfer(msg.value);
        emit PaymentSent(seller, msg.value);

        emit CardPurchased(
            listingId,
            msg.sender,
            seller,
            msg.value,
            cardName,
            cardGrade,
            ipfsHash
        );
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title LandNFT - Simplified Land NFT Contract
 * @dev ERC721-compatible contract for land trading
 * Compatible with Remix IDE and MetaMask
 */
contract LandNFT {
    string public name = "Land NFT";
    string public symbol = "LAND";
    
    uint256 private _tokenIdCounter;
    address public owner;
    address public ltToken;
    
    struct LandListing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isActive;
        uint256 createdAt;
    }
    
    struct LandMetadata {
        string name;
        string description;
        uint256 size;
        string coordinates;
        string imageUrl;
    }
    
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => LandListing) public landListings;
    mapping(uint256 => LandMetadata) public landMetadata;
    
    uint256 public listingFee = 100 * 10**18; // 100 LT tokens
    
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event LandMinted(uint256 indexed tokenId, address indexed owner, string uri);
    event LandListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event LandUnlisted(uint256 indexed tokenId, address indexed seller);
    event LandPurchased(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyTokenOwner(uint256 tokenId) {
        require(_owners[tokenId] == msg.sender, "Not the owner of this token");
        _;
    }
    
    constructor(address _ltTokenAddress) {
        owner = msg.sender;
        ltToken = _ltTokenAddress;
    }
    
    function mintLand(
        address to,
        string memory uri,
        LandMetadata memory metadata
    ) external onlyOwner {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);
        landMetadata[tokenId] = metadata;
        
        emit LandMinted(tokenId, to, uri);
    }
    
    function listLand(uint256 tokenId, uint256 price) external onlyTokenOwner(tokenId) {
        require(price > 0, "Price must be greater than 0");
        require(!landListings[tokenId].isActive, "Already listed");
        
        // Transfer listing fee from seller to contract
        require(LTToken(ltToken).transferFrom(msg.sender, address(this), listingFee), "Listing fee transfer failed");
        
        landListings[tokenId] = LandListing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            isActive: true,
            createdAt: block.timestamp
        });
        
        emit LandListed(tokenId, msg.sender, price);
    }
    
    function unlistLand(uint256 tokenId) external onlyTokenOwner(tokenId) {
        require(landListings[tokenId].isActive, "Not listed");
        
        landListings[tokenId].isActive = false;
        emit LandUnlisted(tokenId, msg.sender);
    }
    
    function purchaseLand(uint256 tokenId) external {
        LandListing memory listing = landListings[tokenId];
        require(listing.isActive, "Not for sale");
        require(msg.sender != listing.seller, "Cannot buy your own land");
        
        require(LTToken(ltToken).transferFrom(msg.sender, listing.seller, listing.price), "Payment failed");
        
        _transfer(listing.seller, msg.sender, tokenId);
        
        landListings[tokenId].isActive = false;
        emit LandPurchased(tokenId, msg.sender, listing.seller, listing.price);
    }
    
    function getActiveListings() external view returns (uint256[] memory) {
        uint256[] memory activeListings = new uint256[](_tokenIdCounter);
        uint256 count = 0;
        
        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            if (landListings[i].isActive) {
                activeListings[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeListings[i];
        }
        
        return result;
    }
    
    function getListing(uint256 tokenId) external view returns (LandListing memory) {
        return landListings[tokenId];
    }
    
    function getLandMetadata(uint256 tokenId) external view returns (LandMetadata memory) {
        return landMetadata[tokenId];
    }
    
    // ERC721 Functions
    function balanceOf(address owner_) external view returns (uint256) {
        require(owner_ != address(0), "Balance query for zero address");
        return _balances[owner_];
    }
    
    function ownerOf(uint256 tokenId) external view returns (address) {
        address owner_ = _owners[tokenId];
        require(owner_ != address(0), "Owner query for nonexistent token");
        return owner_;
    }
    
    function approve(address to, uint256 tokenId) external {
        address owner_ = _owners[tokenId];
        require(to != owner_, "Approval to current owner");
        require(msg.sender == owner_ || _operatorApprovals[owner_][msg.sender], "Approve caller is not owner nor approved for all");
        
        _tokenApprovals[tokenId] = to;
        emit Approval(owner_, to, tokenId);
    }
    
    function getApproved(uint256 tokenId) external view returns (address) {
        require(_exists(tokenId), "Approved query for nonexistent token");
        return _tokenApprovals[tokenId];
    }
    
    function setApprovalForAll(address operator, bool approved) external {
        require(operator != msg.sender, "Approve to caller");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }
    
    function isApprovedForAll(address owner_, address operator) external view returns (bool) {
        return _operatorApprovals[owner_][operator];
    }
    
    function transferFrom(address from, address to, uint256 tokenId) external {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Transfer caller is not owner nor approved");
        _transfer(from, to, tokenId);
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId) external {
        safeTransferFrom(from, to, tokenId, "");
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Transfer caller is not owner nor approved");
        _transfer(from, to, tokenId);
    }
    
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }
    
    // Internal functions
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _owners[tokenId] != address(0);
    }
    
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        require(_exists(tokenId), "Operator query for nonexistent token");
        address owner_ = _owners[tokenId];
        return (spender == owner_ || _tokenApprovals[tokenId] == spender || _operatorApprovals[owner_][spender]);
    }
    
    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "Mint to zero address");
        require(!_exists(tokenId), "Token already minted");
        
        _balances[to] += 1;
        _owners[tokenId] = to;
        
        emit Transfer(address(0), to, tokenId);
    }
    
    function _transfer(address from, address to, uint256 tokenId) internal {
        require(_owners[tokenId] == from, "Transfer from incorrect owner");
        require(to != address(0), "Transfer to zero address");
        
        _approve(address(0), tokenId);
        
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;
        
        emit Transfer(from, to, tokenId);
    }
    
    function _approve(address to, uint256 tokenId) internal {
        _tokenApprovals[tokenId] = to;
        emit Approval(_owners[tokenId], to, tokenId);
    }
    
    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        _tokenURIs[tokenId] = uri;
    }
}

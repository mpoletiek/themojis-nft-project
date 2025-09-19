// The Mojis NFT Contract //
///////////////////////////
// Pausable minting with whitelist functionality.
// When paused: Only whitelisted addresses can mint.
// When unpaused: Anyone can mint (up to max per address).
// Owner can pause/unpause and manage whitelist.
// Max supply and mint limits are modifiable by the owner.
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract TheMojis is ERC721URIStorage, Ownable {
    uint256 public tokenIds = 0;
    uint256 public supply = 4291;
    string public baseTokenURI = "ipfs://QmZdegfWQ1pR4MEyQff7xnV1J47aLUDAhpR5GjsxrdWtFn/";
    uint256 public maxMintPerAddress = 5;
    bool public paused = true;

    mapping(address => bool) public whitelist;

    
    // Events
    event Paused(address account);
    event Unpaused(address account);
    
    constructor(address initialOwner) Ownable(initialOwner) ERC721("The Mojis", "TMJ") { }

    // Pause minting
    function pause() public onlyOwner {
        require(!paused, "Minting is already paused");
        paused = true;
        emit Paused(msg.sender);
    }

    // Unpause minting
    function unpause() public onlyOwner {
        require(paused, "Minting is not paused");
        paused = false;
        emit Unpaused(msg.sender);
    }

    // Mint NFT 
    function mint(address _recipient)
        public 
        returns (uint256)
    {
        require(balanceOf(_recipient) < maxMintPerAddress, "Max mint per address reached.");

        if(paused) {
            require(whitelist[_recipient], "You are not whitelisted.");
            uint256 wlTokenId = tokenIds;
            require(wlTokenId < supply, "No more NFTs");
            _mint(_recipient, wlTokenId);
            tokenIds += 1;
            return wlTokenId;    
        }
        else{
            uint256 tokenId = tokenIds;
            require(tokenId < supply, "No more NFTs");
            _mint(_recipient, tokenId);
            tokenIds += 1;
            return tokenId;
        }
    }

    // Burn NFT
    function burn(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Only the owner of the NFT can burn it.");
        _burn(tokenId);
    }

   
    // Update token supply
    function updateSupply(uint256 _supply)
        public
        onlyOwner()
        returns (uint256)
    {
        require(_supply > tokenIds, "New supply must be greater than current minted supply.");
        supply = _supply;
        return supply;
    }

    // Update Max Mint Per Address
    function updateMaxMintPerAddress(uint256 _maxMintPerAddress)
        public
        onlyOwner()
        returns (uint256)
    {
        maxMintPerAddress = _maxMintPerAddress;
        return maxMintPerAddress;
    }

    // Update Base Token URI
    function updateBaseTokenURI(string memory _baseTokenURI)
        public
        onlyOwner()
        returns (string memory)
    {
        baseTokenURI = _baseTokenURI;
        return baseTokenURI;
    }

    function addToWhitelist(address _user) public onlyOwner {
        whitelist[_user] = true;
    }

    function removeFromWhitelist(address _user) public onlyOwner {
        whitelist[_user] = false;
    }

    // Override tokenURI to return baseURI + tokenId
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721URIStorage)
        returns (string memory)
    {
        ownerOf(tokenId); // This will revert if token doesn't exist
        
        string memory baseURI = baseTokenURI;
        if (bytes(baseURI).length == 0) {
            return "";
        }
        
        return string(abi.encodePacked(baseURI, _toString(tokenId), ".json"));
    }

    // Helper function to convert uint256 to string
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

}
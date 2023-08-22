// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "lib/openzeppelin-contracts/contracts/utils/Counters.sol";
import "lib/openzeppelin-contracts/contracts/utils/Base64.sol";
import "lib/openzeppelin-contracts/contracts/utils/Strings.sol";

contract Base is ERC721, ERC721Enumerable, ERC721Burnable, Ownable {
    uint64 FOREVER_MAX_SUPPLY = 100000000;
    uint64 current_supply = 25600;

    constructor() ERC721("doggo", "k9") {}

    function increase_supply(uint16 new_supply) public onlyOwner {
        require(new_supply > current_supply);
        require(new_supply <= FOREVER_MAX_SUPPLY);
        current_supply = new_supply;
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
    internal
    override(ERC721, ERC721Enumerable){
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }


    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}


contract DimDogs is Base {
    using Counters for Counters.Counter;

    uint256 public revive_price;
    Counters.Counter internal _tokenIdCounter;

    enum Unit {
        wk,
        day,
        hr,
        min,
        sec
    }
    

    struct dog_state {
        uint256 last_pet;
        uint256 last_fed;
        uint256 power;
        uint256 reviveprice;
        uint256 revivenum;
        string name;



    }

    struct User {
        address payable user_address;
        string username;
    }

    // unique username to a user mapping

    uint256 public death_unit;
    uint256 public state_unit;

    uint256 NONCE;

    constructor(
        uint d_unit,
        uint s_unit,
        uint256 d_num,
        uint256 s_num,
        uint256 rev_price
    ) {
        death_unit = d_num * unit_map(Unit(d_unit));
        state_unit = s_num * unit_map(Unit(s_unit));

        revive_price = rev_price * (10**15); // 0.0001 ETH
        NONCE = random(block.timestamp) % 100;
    }

    string[] private background_colors = [
        "#e4dcf1",
        "2f97c1",
        "a42cd6",
        "85ff9e",
        "89f7fe",
        "66a6ff",
        "feada6",
        "f5efef"
        "cfd9df",
        "e2ebf0",
        "eeeeee"
        "dddddd",
        "cccccc",
        "9f8f8",
        "0f0326"
    ];
    string[] private face_colors = [
        "8d5524",
        "ECCBD9",
        "d11141",
        "00b159",
        "00aedb",
        "f37735",
        "ffc425",
        "fe4a49",
        "2ab7ca",
        "de6e4b",
        "b7990d",
        "110B11",
        "8f7e4f",
        "adacb5",
        "ffdbac",
        "3d1e6d",
        "8874a3"
    ];
    string[] private parts_colors = [
        "dd0426",
        "080705",
        "e2d4b7",
        "dd2d4a",
        "dd2d4a",
        "2a2a72",
        "ffe548",
        "1f1a38",
        "0a0908",
        "293f14"
    ];

    // struct UserChainInfo

    mapping(uint256 => dog_state) dogs;
    mapping(string => User) public users;


    /** Map enum time values to their native solidity integer equivalents */
    function unit_map(Unit unit) internal pure returns (uint256) {
        if (unit == Unit.wk) return 1 weeks;
        if (unit == Unit.hr) return 1 hours;
        if (unit == Unit.day) return 1 days;
        if (unit == Unit.min) return 1 minutes;
        if (unit == Unit.sec) return 1 seconds;

        revert("invalid time unit");
    }

    // User management
   
    event GlobalUserStateChange(string indexed action, string actual_action, string new_ipfs_global_userstate_cid, address user_address, uint timestamp);

    /** ensures that the username is associated to the account that is calling the function */
    modifier usernameMatchesSender(string memory username_0) {
        require(
            users[username_0].user_address == msg.sender,
            "the address does not match the person"
        );
        _;
    }

    /** After the user creation has happened on ipfs, create the user on chain and emit the new cid  */
    function create_user(string memory username, string memory new_ipfs_global_userstate_cid)
            external
        {
        require(
            users[username].user_address == address(0),
            "username is already associated with an address"
        );
        users[username] = User(payable(msg.sender), username);
        emit GlobalUserStateChange("create_user", "create_user", new_ipfs_global_userstate_cid, msg.sender, block.timestamp);
    }

    /** When a user wants to add themselves to another supported chain
    verify that it is an authorised account that initiated the process and emit the new cid */
    function associate_address(string memory username, string memory new_ipfs_global_userstate_cid, address new_address)
        external
        usernameMatchesSender(username)
    {
        emit GlobalUserStateChange("associate_address", "associate_address", new_ipfs_global_userstate_cid, new_address, block.timestamp);
    }


    // Doggo actions


     /** Generate a 'random' number */
    function random(uint256 input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

    function random_range(uint256 min, uint256 max) internal view returns (uint256) {

        return (random(block.timestamp) % (max - min)) + min;
    }

    /** Check if a doggo is hungry */
    function is_hungry(uint256 id) public view returns (bool) {
        return block.timestamp > dogs[id].last_fed + state_unit;
    }

    /** Check if a doggo is happy */
    function is_happy(uint256 id) public view returns (bool) {
        return block.timestamp < dogs[id].last_pet + state_unit;
    }

    /** Check if a doggo is dead */
    function is_dead(uint256 id) public view returns (bool) {
        return block.timestamp > dogs[id].last_fed + death_unit;
    }

    /** Revive a dead doggo */
    function revive(uint256 id) public payable {
        require(ownerOf(id) == msg.sender, "you do not own this doggo");
        require(is_dead(id), "your doggo is very much alive");
        require(msg.value >= revive_price, "revival price to low");

        dogs[id].last_fed = block.timestamp;
        dogs[id].reviveprice = dogs[id].reviveprice * 2;
        dogs[id].revivenum = dogs[id].revivenum + 1;
        dogs[id].power = dogs[id].power / 2;
    }

    /** Feed doggo that sender owns with specified token ID */
    function feed_doggo(uint256 id) public {
        require(ownerOf(id) == msg.sender, "you do not own this doggo");
        require(!is_dead(id));

        dogs[id].last_fed = block.timestamp;
        dogs[id].power = random_range(10, 100);
    }

    /** Pet doggo that sender owns with specified token ID */
    function pet_doggo(uint256 id) public {
        require(ownerOf(id) == msg.sender, "you do not own this doggo");
        require(!is_dead(id), "your doggo is dead");

        dogs[id].last_pet = block.timestamp;
        dogs[id].power = random_range(50, 200);
    }

    /**
    Mint a new doggo token
    */
    function create_doggo(string memory name) public {
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(msg.sender, tokenId);
        _tokenIdCounter.increment();

        dogs[tokenId] = dog_state(block.timestamp, block.timestamp, 1000, revive_price, 0, name);
    }

    /**
    Generates svg for background of doggo 
    */
    function get_background(uint256 id) private view returns (string memory) {
        uint256 background_index = random(id + NONCE) %
            background_colors.length;
        return
            string(
                abi.encodePacked(
                    "<rect width='2048' height='2e3' fill='#",
                    background_colors[background_index],
                    "'/>"
                )
            );
    }


    /**
    Generates svg for doggo head based on doggo state 
    */
    function get_head(uint256 id) private view returns (string memory) {
        uint256 head_index = random(id + NONCE) % face_colors.length;

        return
            string(
                abi.encodePacked(
                    "<path d='m1443 984.5c0 232.79-192.07 421.5-429 421.5s-429-188.71-429-421.5c0-232.79 192.07-421.5 429-421.5s429 188.71 429 421.5z' fill='#",
                    face_colors[head_index],
                    "'/>"
                )
            );
    }

    /**
    Generates svg for doggo ears based on doggo state 
    */
    function get_ears(uint256 id) private view returns (string memory) {
        uint256 ear_index = random(id + NONCE + 1) % face_colors.length;
        string memory ear1 = string(
            abi.encodePacked(
                "<path d='m599.2 981.09c-59.205 145.04-179.35 174.98-243.56 145.04-69.507-22.99-90.959-77.74-51.935-191.3 4.451-39.189 31.395-68.316 53.354-121.8 57.619-140.32 98.416-160.35 164.35-134.61 221.37 68.603 222.59 50.572 77.794 302.66z' fill='#",
                face_colors[ear_index],
                "'/>"
            )
        );
        string memory ear2 = string(
            abi.encodePacked(
                "<path d='m1462.7 1008.7c59.21 145.03 179.35 174.98 243.57 145.03 69.5-22.99 90.96-77.74 51.93-191.3-4.45-39.189-31.39-68.317-53.35-121.8-57.62-140.32-98.42-160.35-164.35-134.61-221.38 68.603-222.59 50.572-77.8 302.67z' fill='#",
                face_colors[ear_index],
                "'/>"
            )
        );
        return string(abi.encodePacked(ear1, ear2));
    }

    /**
    Generates svg for doggo face based on doggo state 
    */
    function get_face(uint256 id) private view returns (string memory) {
        string memory mouth;
        string memory eyes;
        string memory face_color = parts_colors[
            random(id + NONCE) % parts_colors.length
        ];

        if (is_happy(id) && !is_hungry(id)) {
            mouth = string(
                abi.encodePacked(
                    "<path d='m1007 1104v67.49m-72-6.5 6.44 9.17c4.28 6.09 10.24 10.8 17.15 13.57 2.93 1.17 5.99 1.97 9.11 2.4 8.92 1.2 17.97-0.77 25.58-5.56l1.72-1.08 11.5-12 7.51 8.72c5.16 6 12.27 9.98 20.07 11.25 6.16 1 12.47 0.27 18.24-2.11l1.2-0.5c8.38-3.46 15.25-9.79 19.4-17.85l3.08-6.01' stroke='#",
                    face_color,
                    "' stroke-width='8'/>'"
                )
            );
        } else {
            mouth = string(
                abi.encodePacked(
                    "<path d='M1007 1104L1008 1166M1052 1218C1027.17 1137.97 980.269 1160.25 964 1218' stroke='#",
                    face_color,
                    "' stroke-width='8'/>'"
                )
            );
        }

        if (is_dead(id)) {
            eyes = string(
                abi.encodePacked(
                    "<path d='M775.497 833L927 955M775 955L926.503 833' stroke='#",
                    face_color,
                    "' stroke-width='8'/>",
                    "<path d='M1078.5 833L1230 955M1078 955L1229.5 833' stroke='#",
                    face_color,
                    "' stroke-width='8'/>"
                )
            );
        } else {
            eyes = string(
                abi.encodePacked(
                    "<path d='m887.34 906.1c-2.613 39.835-25.196 70.786-50.44 69.131-25.244-1.656-43.59-35.292-40.977-75.126 2.612-39.835 25.195-70.786 50.439-69.131 25.244 1.656 43.586 35.292 40.978 75.126z' fill='#",
                    face_color,
                    "'/>",
                    "<path d='m1211.4 913.11c0 39.921-20.51 72.283-45.81 72.283s-45.8-32.362-45.8-72.283 20.5-72.283 45.8-72.283 45.81 32.362 45.81 72.283z' fill='#",
                    face_color,
                    "'/>"
                )
            );
        }

        return
            string(
                abi.encodePacked(
                    eyes,
                    "<path d='m1020.5 1097.9c-8.13 8.49-21.785 8.18-29.505-0.67l-49-56.11c-11.33-12.98-2.05-33.25 15.18-33.16 36.13 0.19 66.255 0.35 102.16 0.54 17.56 0.1 26.49 21.15 14.35 33.83l-53.18 55.57z' fill='#",
                    face_color,
                    "'/>",
                    mouth
                )
            );
    }

    /**
    Get the URI for a token. Token URI contains base64
    encoded representation of the state of token
    */
    function tokenURI(uint256 id)
        public
        view
        override(ERC721)
        returns (string memory)
    {
        string memory image = string(
            abi.encodePacked(
                get_background(id),
                get_head(id),
                get_ears(id),
                get_face(id)
            )
        );

        dog_state storage dog = dogs[id];

        image = string(
            abi.encodePacked(
                "<?xml version='1.0' encoding='UTF-8'?>",
                "<svg fill='none' viewBox='0 0 2048 2000' xmlns='http://www.w3.org/2000/svg'>",
                image,
                "</svg>"
            )
        );

        string memory last_fed_in_hours = Strings.toString(dog.last_fed);
        string memory last_pet_in_hours = Strings.toString(dog.last_pet);

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        "{'name': '",
                        dog.name,
                        "', 'power': '",
                        Strings.toString(dog.power),
                        "', 'revivenum': '",
                        Strings.toString(dog.revivenum),
                        "', 'reviveprice': '",
                        Strings.toString(dog.reviveprice),
                        "', 'last_fed':'",
                        last_fed_in_hours,
                        "', 'last_pet':'",
                        last_pet_in_hours,
                        "', 'image': '",
                        "data:image/svg+xml;base64,",
                        Base64.encode(bytes(image)),
                        "'}"
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }
}
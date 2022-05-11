// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WaitlistPortal {
    uint256 totalWaitlist;

    address payable public owner;

    /*
     * 
     * message= waitlist event, name= wallet address
     */
    event NewWaitlist(
        address indexed from,
        uint256 timestamp,
        string waitlist,
        string walletaddress
    );

    constructor() payable {
        console.log("Cypherpunk 2022 Smart Contract!");

        // user who is calling this function address
        owner = payable(msg.sender);
    }

    struct Waitlist {
      address giver; // The address of the user who saves a spot on a waitlist
      string waitlist; // The waitlist event name
      string walletaddress; // The wallet address
      uint256 timestamp; // The timestamp when the user saves a spot on a wait list
    }

    Waitlist[] waitlist;

    /*
     * I added a function getAllWaitLists which will return the struct array
     * This will make it easy to retrieve the waitlist instance 
     */
    function getAllWaitlists() public view returns (Waitlist[] memory) {
      return waitlist;
    }

    // Get All wait lists
    function getTotalWaitlist() public view returns (uint256) {
        // Optional: Add this line if you want to see the contract print the value!
        // We'll also print it over in run.js as well.
        console.log("We have %d total wait lists recieved ", totalWaitlist);
        return totalWaitlist;
    }

  
    function bookWaitlist(
        string memory _waitlistevent,
        string memory _walletaddress,
        uint256 _payAmount
    ) public payable {
        uint256 cost = 0.001 ether;
        require(_payAmount <= cost, "Insufficient Ether provided");

        for (uint i; i < waitlist.length; i++) {
          if (waitlist[i].walletaddress == id) {
            return '';
          }
        }


        (bool success, ) = owner.call{value: _payAmount}("");
        require(success, "Failed to send money");

        /*
         * This is where we actually store the wait list data in the array.
         */
        waitlist.push(Waitlist(msg.sender, _waitlistevent, _walletaddress, block.timestamp));
        totalWaitlist += 1;
        console.log("%s has just saved their spot on the wait list!", msg.sender);


        emit NewWaitlist(msg.sender, block.timestamp, _waitlistevent, _walletaddress);
    }
}

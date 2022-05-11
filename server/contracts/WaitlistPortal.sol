// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WaitlistPortal {
    address payable public owner;

    /*
     * 
     * message= waitlist event, name= wallet address
     */
    event NewEntry(
      address indexed from,
      uint256 timestamp,
      string waitlistName,
      string walletaddress
    );

    constructor() payable {
        console.log("Cypherpunk 2022 Waitlist!");
        // user who is calling this function address
        owner = payable(msg.sender);
    }

    struct WaitlistEntry {
      address signer; // The address of the user who saves a spot on a waitlist
      string walletaddress; // The wallet address
      uint256 timestamp; // The timestamp when the user saves a spot on a wait list
    }

    struct Waitlist {
      string name;
      WaitlistEntry[] entries;
    }

    Waitlist[] waitlists;

    /*
     * I added a function getAllWaitLists which will return the struct array
     * This will make it easy to retrieve the waitlist instance 
     */
    function getAllWaitlists() public view returns (Waitlist[] memory) {
      return waitlists;
    }

    function getWaitlist(string memory _waitlistName) public view returns (Waitlist memory) {
      for (uint i; i < waitlists.length; i++) {
        if (waitlists[i].name == _waitlistName) {
          return waitlist;
        }
      }

      console.log("No waitlist was found for supplied waitlist name.");
    }

  
    function bookWaitlist(
        string memory _waitlistName,
        string memory _walletaddress,
        uint256 _payAmount
    ) public payable {
        uint256 cost = 0.001 ether;
        waitlist Waitlist;

        require(_payAmount <= cost, "Insufficient Ether provided");

        for (uint i; i < waitlist.length; i++) {
          if (waitlists[i].name == _waitlistName) {
            waitlist = waitlists[i];
          }
        }

        if (!waitlist) {
          // If no waitlist was found, create one using the supplied name.
          waitlist = Waitlist(_waitlistName, []);
          waitlists.push(waitlist);
        }

        // require(waitlist, "No waitlist was found for supplied waitlist name.");

        (bool success, ) = owner.call{value: _payAmount}("");
        require(success, "Failed to send money");

        /*
         * This is where we actually store the wait list data in the array.
         */
        waitlist.entries.push(WaitlistEntry(msg.sender, _walletaddress, block.timestamp));
        console.log("%s has just saved their spot on the wait list!", msg.sender);

        emit NewEntry(msg.sender, block.timestamp, waitlist.name, _walletaddress);
    }
}

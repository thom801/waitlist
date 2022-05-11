import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { ethers } from "ethers";
import "react-toastify/dist/ReactToastify.css";

import Head from "next/head";
import abi from "../utils/WaitlistPortal.json";

export default function Home() {
  /**
   * Create a variable here that holds the contract address after you deploy!
   */
  const contractAddress = "0x2cC89c7c65Ad0c36BC4b1aA4956074bF29be5e54";

  /**
   * Create a variable here that references the abi content!
   */
  const contractABI = abi.abi;

  /*
   * Just a state variable we use to store our user's public wallet.
   */
  const [currentAccount, setCurrentAccount] = useState("");

  const [waitlist, setWaitlist] = useState("");

  const [walletaddress, setWalletAddress] = useState("");

  /*
   * All state property to store the waitlist data.
   */
  const [allWaitlists, setAllWaitlist] = useState([]);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        toast.success("🦄 Wallet is Connected", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.warn("Make sure you have MetaMask Connected", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      toast.error(`${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  /**
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        toast.warn("Make sure you have MetaMask Connected", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const bookWaitlist = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const waitlistPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await waitlistPortalContract.getTotalWaitlist();
        console.log("Retrieved total waitlist count...", count.toNumber());

        /*
         * Execute the actual waitlist instance from smart contract
         */
        const waitlistTxn = await waitlistPortalContract.bookWaitlist(
          waitlist ? waitlist : "Thanks for booking your spot on the waitlist! ",
          walletaddress ? walletaddress : "Anonymous",
          ethers.utils.parseEther("0.001"),
          {
            gasLimit: 300000,
          }
        );
        console.log("Mining...", waitlistTxn.hash);

        toast.info("Sending Fund for saving spot on waitlist...", {
          position: "top-left",
          autoClose: 18050,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        await waitlistTxn.wait();

        console.log("Mined -- ", waitlistTxn.hash);

        count = await waitlistPortalContract.getTotalWaitlist();

        console.log("Retrieved total wait list count...", count.toNumber());

        setWaitlist("");
        setWalletAddress("");

        toast.success("Wait list spot saved!", {
          position: "top-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      toast.error(`${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  /*
   * Create a method that gets all wait list spots from your contract
   */
  const getAllWaitlists = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const waitlistPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        /*
         * Call the getAllWaitlist method from your Smart Contract
         */
        const waitlists = await waitlistPortalContract.getAllWaitlist();

        /*
         * We only need address, timestamp, walletaddress, and waitlists in our UI so let's
         * pick those out
         */
        const waitListCleaned = waitlists.map((waitlist) => {
          return {
            address: waitlist.giver,
            timestamp: new Date(waitlist.timestamp * 1000),
            waitlist: waitlist.waitlist,
            walletaddress: waitlist.walletaddress,
          };
        });

        /*
         * Store our data in React State
         */
        setAllWaitlist(waitListCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    let waitlistPortalContract;
    getAllWaitlists();
    checkIfWalletIsConnected();

    const NewWaitlist = (from, timestamp, waitlist, walletaddress) => {
      console.log("New Waitlist", from, timestamp, waitlist, walletaddress);
      setAllWaitlist((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          waitlist: waitlist,
          walletaddress: walletaddress,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      waitlistPortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      waitlistPortalContract.on("NewWaitlist", NewWaitlist);
    }

    return () => {
      if (waitlistPortalContract) {
        waitlistPortalContract.off("NewWaitlist", NewWaitlist);
      }
    };
  }, []);

  const handleOnWaitlistChange = (event) => {
    const { value } = event.target;
    setWaitlist(value);
  };
  const handleOnWalletAddressChange = (event) => {
    const { value } = event.target;
    setWalletAddress(value);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>CypherPunk 2022 </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold text-blue-600 mb-6">
          Book a spot on the Rinkeby blockchain waitlist
        </h1>

        {/*
         * If there is currentAccount render this form, else render a button to connect wallet
         */}

        {currentAccount ? (
          <div className="w-full max-w-xs sticky top-3 z-50 ">
            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="walletaddress"
                >
                  Wallet address
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="wallet_address"
                  type="text"
                  placeholder="Wallet Address"
                  onChange={handleOnWalletAddressChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="waitlistevent"
                >
                  Enter Wait list name
                </label>

                <textarea
                  className="form-textarea mt-1 block w-full shadow appearance-none py-2 px-3 border rounded text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                  placeholder="Waitlist"
                  id="waitlist"
                  onChange={handleOnWaitlistChange}
                  required
                ></textarea>
              </div>

              <div className="flex items-left justify-between">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-center text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={bookWaitlist}
                >
                  Posting Fee: £1
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <p className="text-2xl text-blue-600 mb-6">
              You can switch your wallet to Rinkeby Testnet Network to test this
              application.
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-full mt-3"
              onClick={connectWallet}
            >
              Connect Your Wallet
            </button>
          </div>
        )}

        {allWaitlists.map((waitlist, index) => {
          return (
            <div className="border-l-2 mt-10" key={index}>
              <div className="transform transition cursor-pointer hover:-translate-y-2 ml-10 relative flex items-center px-6 py-4 bg-blue-800 text-white rounded mb-10 flex-col md:flex-row space-y-4 md:space-y-0">
                {/* <!-- Dot Following the Left Vertical Line --> */}
                <div className="w-5 h-5 bg-blue-600 absolute -left-10 transform -translate-x-2/4 rounded-full z-10 mt-2 md:mt-0"></div>

                {/* <!-- Line that connecting the box with the vertical line --> */}
                <div className="w-10 h-1 bg-green-300 absolute -left-10 z-0"></div>

                {/* <!-- Content that showing in the box --> */}
                <div className="flex-auto">
                  <h1 className="text-md">Wait list spot owner: {waitlist.walletaddress}</h1>
                  <h1 className="text-md">Wait list for: {waitlist.waitlist}</h1>
                  <h3>Address: {waitlist.address}</h3>
                  <h1 className="text-md font-bold">
                    TimeStamp: {waitlist.timestamp.toString()}
                  </h1>
                </div>
              </div>
            </div>
          );
        })}
      </main>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

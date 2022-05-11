const main = async () => {
    const waitlistContractFactory = await hre.ethers.getContractFactory(
      "WaitlistPortal"
    );
    const waitlistContract = await waitlistContractFactory.deploy({
      value: hre.ethers.utils.parseEther("0.1"),
    });
    await waitlistContract.deployed();
    console.log("Waitlist Contract deployed to:", waitlistContract.address);
  
    /*
     * Get Contract balance
     */
    let contractBalance = await hre.ethers.provider.getBalance(
      waitlistContract.address
    );
    console.log(
      "Contract balance:",
      hre.ethers.utils.formatEther(contractBalance)
    );
  
    /*
     * Let's try to save to the waitlist
     */
    const waitlistTxn = await waitlistContract.bookWaitlist(
      "Saving first waitlist record",
      "jackie - cypherpunk 2022",
      ethers.utils.parseEther("0.001")
    );
    await waitlistTxn.wait();
  
    /*
     * Get Contract balance to see what happened!
     */
    contractBalance = await hre.ethers.provider.getBalance(
      waitlistContract.address
    );
    console.log(
      "Contract balance:",
      hre.ethers.utils.formatEther(contractBalance)
    );
  
    let allWaitlists = await waitlistContract.getAllWaitlists();
    console.log(allwaitlists);
  };
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();
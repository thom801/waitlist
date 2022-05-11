const main = async () => {

  // This will actually compile our contract and generate the necessary files we need to work with our contract under the artifacts directory.
    const waitlistContractFactory = await hre.ethers.getContractFactory('WaitlistPortal');
    const waitlistContract = await waitlistContractFactory.deploy();
  
    await waitlistContract.deployed(); // We'll wait until our contract is officially deployed to our local blockchain! Our constructor runs when we actually deploy.
  
   console.log("Waitlist Contract deployed to:", waitlistContract.address);
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
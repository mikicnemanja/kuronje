const fs = require("fs");
const path = require("path");

function updateABI() {
  try {
    console.log("🔧 Starting ABI generation...");

    // Path to the compiled contract
    const contractPath = "./out/KuronjeNFT.sol/KuronjeNFT.json";

    // Check if contract exists
    if (!fs.existsSync(contractPath)) {
      console.error("❌ Contract not found. Run `forge build` first.");
      process.exit(1);
    }

    // Read the compiled contract
    const contractJson = JSON.parse(fs.readFileSync(contractPath, "utf8"));
    const abi = contractJson.abi;

    // Create root contracts directory
    const contractsDir = "./contracts";

    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir, { recursive: true });
      console.log("📁 Created contracts directory");
    }

    // Generate ABI (JSON format)
    const abiContent = JSON.stringify(abi, null, 2);

    fs.writeFileSync(path.join(contractsDir, "KuronjeABI.json"), abiContent);
    console.log("✅ ABI updated: contracts/KuronjeABI.json");

    // Generate ABI summary for verification
    const summary = {
      contractName: "KuronjeNFT",
      generatedAt: new Date().toISOString(),
      functions: abi
        .filter((item) => item.type === "function")
        .map((f) => f.name),
      events: abi.filter((item) => item.type === "event").map((e) => e.name),
      errors: abi.filter((item) => item.type === "error").map((e) => e.name),
      totalItems: abi.length,
    };

    console.log("📊 ABI Summary:");
    console.log(
      `   Functions: ${summary.functions.length} (${summary.functions.join(
        ", "
      )})`
    );
    console.log(
      `   Events: ${summary.events.length} (${summary.events.join(", ")})`
    );
    console.log(
      `   Errors: ${summary.errors.length} (${summary.errors.join(", ")})`
    );
    console.log(`   Total ABI items: ${summary.totalItems}`);

    console.log("🎉 ABI generation completed successfully!");
  } catch (error) {
    console.error("❌ Error generating ABI:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  updateABI();
}

module.exports = updateABI;

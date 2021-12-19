import { ethers } from "hardhat";
import { exit } from "process";
import { hexConcat } from "@ethersproject/bytes";

async function main() {
    const res = hexConcat([
        '0xa9059cbb', 
        ethers.utils.defaultAbiCoder.encode(["address", "uint256"], 
        ["0xDA591C6EaD892A6e67cAD2c79Ab5B38aa662A0E2", "10000000000000000000"])]);
    console.log(res);
    //0xa9059cbb000000000000000000000000da591c6ead892a6e67cad2c79ab5b38aa662a0e20000000000000000000000000000000000000000000000008ac7230489e80000 
}

main()
    .then(() => process.exit(0))
    .catch((error) =>  {
        console.error(error);
        process.exit(1);
    });
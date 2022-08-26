const {expect} = require("chai");
const { ethers } = require("hardhat");

// TODO constructorのテスト？

// TODO beforeEach
describe("mint", function () {
    it('Should be reverted if mint is paused', async function () {
        // TODO
    })
    it('Should be reverted if the caller purchases exceeded max token at once', async function () {
        const nft = await ethers.getContractFactory("MyContract");
        const [owner, addr1, addr2] = await ethers.getSigners();
        const hardhatToken = await nft.deploy();
        // TODO 移行したい
        await hardhatToken.connect(owner).pause(false);

        // 1回で6個のトークンをmint
        await expect(hardhatToken.connect(addr1).mint(6)).to.be.revertedWith('claim is over max quantity at once');
    })
    it('Should be reverted if exceeded max supply', async function () {
        // TODO
    })
    it('Should be reverted if the caller has not enough eth', async function () {
        // TODO
    })
    it('Should be reverted if the caller is not in whitelist during only whitelisted sale', async function () {
        // TODO
    })
    it('Should be reverted if the caller has not enough whitelist spots during only whitelisted sale', async function () {
        // TODO
    })
    // TODO
    it("mint関数を叩いたら、ウォレットにNFTが紐づけられること", async function () {
        const nft = await ethers.getContractFactory("MyContract");
        const [owner, addr1, addr2] = await ethers.getSigners();
        const hardhatToken = await nft.deploy();
        // TODO 移行したい
        await hardhatToken.connect(owner).pause(false);

        await hardhatToken.connect(addr1).mint(1, {value: ethers.utils.parseEther("0.001")});

        expect(await hardhatToken.ownerOf(11)).to.equal(addr1.address);
    })
});

// TODO
describe("burnMint", function () {
});

describe('addWhitlist', function () {
    it ('Should be reverted because the caller is not owner', async function () {
        const nft = await ethers.getContractFactory("MyContract");
        const [owner, addr1, addr2] = await ethers.getSigners();
        const hardhatToken = await nft.deploy();

        await expect(hardhatToken.connect(addr1).addWhitelists([addr2.address],[5])).to.be.revertedWith('Ownable: caller is not the owner');
    })
    it ('Should be reverted if arguments addresses and counts dont match', async function () {
        // TODO
    })
});
describe('setMaxSupply', function () {
    it ('Should be reverted because the caller is not owner', async function () {
        // TODO
    })
});
describe('setMaxBurnMint', function () {
    it ('Should be reverted because the caller is not owner', async function () {
        // TODO
    })
});
describe('setBaseURI', function () {
    it ('Should be reverted because the caller is not owner', async function () {
        // TODO
    })
});
describe('setMintCost', function () {
    it ('Should be reverted because the caller is not owner', async function () {
        // TODO
    })
});
describe('setBurnMintCost', function () {
    it ('Should be reverted because the caller is not owner', async function () {
        // TODO
    })
});
describe('setOnlyWhitelisted', function () {
    it ('Should be reverted because the caller is not owner', async function () {
        // TODO
    })
});
describe('setMaxMintAmount', function () {
    it ('Should be reverted because the caller is not owner', async function () {
        // TODO
    })
});
describe('setMaxMintAmountForWhiteList', function () {
    it ('Should be reverted because the caller is not owner', async function () {
        // TODO
    })
});
describe('setBaseExtension', function () {
    it ('Should be reverted because the caller is not owner', async function () {
        // TODO
    })
});
describe('pause', function () {
    it ('Should be reverted because the caller is not owner', async function () {
        // TODO
    })
});
describe('burnMintPause', function () {
    it ('Should be reverted because the caller is not owner', async function () {
        // TODO
    })
});
describe('withdraw', function () {
    it ('Should be reverted because the caller is not owner', async function () {
        // TODO
    })
    // TODO
    it ('', async function () {
    })
});

describe('withdraw', function () {
    it ('Should be reverted because the caller is not owner', async function () {
        // TODO
    })
});

describe('_startTokenId', function () {
    it ('', async function () {
        // TODO
    })
});




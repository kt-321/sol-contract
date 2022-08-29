const {expect} = require("chai");
const { ethers } = require("hardhat");

describe("MyContract", function () {
    let nft, hardhatToken, owner, addr1, addr2, addrs
    beforeEach(async function(){
        nft = await ethers.getContractFactory("MyContract");
        ;[owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
        hardhatToken = await nft.deploy();
    })

    describe('Deployment', function () {
        it('Should set the right owner', async function () {
            expect(await hardhatToken.owner()).to.equal(owner.address)
        })
    })
    // TODO
    describe('Constructor', function () {
        it('correct baseURI', async function () {
            // TODO
        })
        it('10 tokens are minted by withdrawAddress', async function () {
            // TODO
        })
    })

    describe("mint", function () {
        beforeEach(async function(){
            await hardhatToken.connect(owner).pause(false);
        })

        it("Can mint token", async function () {
            await hardhatToken.connect(addr1).mint(1, {value: ethers.utils.parseEther("0.001")});

            expect(await hardhatToken.ownerOf(11)).to.equal(addr1.address);
        })

        it('Should be reverted if mint is paused', async function () {
            await hardhatToken.connect(owner).pause(true);
            const overrides = {
                value: ethers.utils.parseEther('0.001'),
            }
            await expect(hardhatToken.connect(addr1).mint(1, overrides)).to.be.revertedWith('mint is paused');
        })

        it('Should be reverted if the caller purchases exceeded max token at once', async function () {
            const overrides = {
                value: ethers.utils.parseEther('0.006'),
            }
            // mint 6 nfts at once
            await expect(hardhatToken.connect(addr1).mint(6, overrides)).to.be.revertedWith('claim is over max quantity at once');
        })

        it('Should be reverted if exceeded max supply', async function () {
            hardhatToken.connect(owner).setMaxSupply(1)
            const overrides = {
                value: ethers.utils.parseEther('0.002'),
            }
            await expect(hardhatToken.connect(addr1).mint(2, overrides)).to.be.revertedWith('exceed max supply');
        })

        it('Should be reverted if the caller does not have enough eth', async function () {
            const overrides = {
                value: ethers.utils.parseEther('0.0009'),
            }
            await expect(hardhatToken.connect(addr1).mint(1, overrides)).to.be.revertedWith('not enough eth');
        })

        it('Can mint during only whitelisted sale if the caller has whitelist spot', async function () {
            hardhatToken.connect(owner).addWhitelists([addr1.address],[10])
            await hardhatToken.connect(owner).setOnlyWhitelisted(true)
            const overrides = {
                value: ethers.utils.parseEther('0.01'),
            }
            await hardhatToken.connect(addr1).mint(10, overrides);
            for (let i=0; i<10; i++) {
                expect(await hardhatToken.ownerOf(i+11)).to.equal(addr1.address);
            }
        })

        it('Should be reverted if the caller is not in whitelist during only whitelisted sale', async function () {
            await hardhatToken.connect(owner).setOnlyWhitelisted(true)
            const overrides = {
                value: ethers.utils.parseEther('0.01'),
            }
            await expect(hardhatToken.connect(addr1).mint(10, overrides)).to.be.revertedWith('sender is not whitelisted');
        })

        it('Should be reverted if the caller has not enough whitelist spots during only whitelisted sale', async function () {
            await hardhatToken.connect(owner).setOnlyWhitelisted(true)
            hardhatToken.connect(owner).addWhitelists([addr1.address],[9])
            const overrides = {
                value: ethers.utils.parseEther('0.01'),
            }
            await expect(hardhatToken.connect(addr1).mint(10, overrides)).to.be.revertedWith('over whitelisted count');
        })
    });

    describe("burn mint", function () {
        beforeEach(async function(){
            await hardhatToken.connect(owner).pause(false);
            await hardhatToken.connect(owner).burnMintPause(false);
        })

        it("Can burn mint token", async function () {
            let overrides = {
                value: ethers.utils.parseEther('0.002'),
            }
            await hardhatToken.connect(addr1).mint(2, overrides);
            overrides = {
                value: ethers.utils.parseEther('0.003'),
            }
            await hardhatToken.connect(addr2).mint(3, overrides);

            await hardhatToken.connect(owner).setOnlyWhitelisted(true);
            await hardhatToken.connect(owner).addWhitelists([addr1.address],[5]);

            await hardhatToken.connect(addr1).burnMint([11, 12], overrides);

            for (let i=0; i<2; i++) {
                expect(await hardhatToken.ownerOf(i+16)).to.equal(addr1.address);
            }

            // have burned
            expect(await hardhatToken.exists(11)).to.be.false
            expect(await hardhatToken.exists(12)).to.be.false
        })

        it('Should be reverted if burn mint is paused', async function () {
            const overrides = {
                value: ethers.utils.parseEther('0.001'),
            }
            await hardhatToken.connect(addr1).mint(1, overrides);
            await hardhatToken.connect(owner).setOnlyWhitelisted(true);
            await hardhatToken.connect(owner).addWhitelists([addr1.address],[5]);
            await hardhatToken.connect(owner).burnMintPause(true);

            await expect(hardhatToken.connect(addr1).burnMint([11], overrides)).to.be.revertedWith('burn mint is paused');
        })

        it('Should be reverted if the caller burn mint exceeded max burn mint supply', async function () {
            let overrides = {
                value: ethers.utils.parseEther('0.005'),
            }
            await hardhatToken.connect(owner).addWhitelists([addrs[0].address, addrs[1].address, addrs[2].address, addrs[3].address, addrs[4].address],[5, 5, 5, 5, 5]);

            for (i=0; i<5; i++) {
                await hardhatToken.connect(addrs[i]).mint(5, overrides);
            }
            await hardhatToken.connect(addrs[4]).mint(4, overrides);
            await hardhatToken.connect(addrs[5]).mint(2, overrides);

            await hardhatToken.connect(owner).setOnlyWhitelisted(true);
            
            // 5*3+4+2=21
            for (i=0; i<3; i++) {
                firstToken = 11+i*5
                c = await hardhatToken.whitelistCounts(addrs[i].address)
                console.log(i, ":",c)
                await hardhatToken.connect(addrs[i]).burnMint([firstToken, firstToken+1, firstToken+2, firstToken+3, firstToken+4], overrides);
            }

            overrides = {
                value: ethers.utils.parseEther('0.004')
            }
            await hardhatToken.connect(addrs[3]).burnMint([26, 27, 28, 29], overrides);

            overrides = {
                value: ethers.utils.parseEther('0.002')
            }
            await expect(hardhatToken.connect(addrs[4]).burnMint([30, 31], overrides)).to.be.rejectedWith('over total burn mint count');
        })

        it('Should be reverted if the caller does not have enough eth', async function () {
            let overrides = {
                value: ethers.utils.parseEther('0.001'),
            }
            await hardhatToken.connect(addr1).mint(1, overrides);
            await hardhatToken.connect(owner).setOnlyWhitelisted(true);
            await hardhatToken.connect(owner).addWhitelists([addr1.address],[5]);
            overrides = {
                value: ethers.utils.parseEther('0.0009'),
            }
            await expect(hardhatToken.connect(addr1).burnMint([11], overrides)).to.be.rejectedWith('not enough eth');
        })

        it('Should be reverted if the caller is not in whitelist', async function () {
            let overrides = {
                value: ethers.utils.parseEther('0.001'),
            }
            await hardhatToken.connect(addr1).mint(1, overrides);
            await hardhatToken.connect(owner).setOnlyWhitelisted(true);
            overrides = {
                value: ethers.utils.parseEther('0.001'),
            }
            await expect(hardhatToken.connect(addr1).burnMint([11], overrides)).to.be.rejectedWith('sender is not whitelisted');
        })

        it('Should be reverted if the caller does not have enough whitelist spots', async function () {
            let overrides = {
                value: ethers.utils.parseEther('0.003'),
            }
            await hardhatToken.connect(addr1).mint(3, overrides);
            await hardhatToken.connect(owner).setOnlyWhitelisted(true);
            await hardhatToken.connect(owner).addWhitelists([addr1.address],[2]);
            overrides = {
                value: ethers.utils.parseEther('0.003'),
            }
            await expect(hardhatToken.connect(addr1).burnMint([11, 12, 13], overrides)).to.be.rejectedWith('over whitelisted count');
        })
    });

    describe('setMaxSupply', function () {
        it ('Contract owner can execute', async function () {
            await expect(hardhatToken.connect(owner).setMaxSupply(1000))
            expect(await hardhatToken.maxSupply()).to.be.equal(1000);
        })

        it ('Should be reverted if the caller is not owner', async function () {
            await expect(hardhatToken.connect(addr1).setMaxSupply(1000)).to.be.revertedWith('Ownable: caller is not the owner');
        })
    });
    describe('setMaxBurnMint', function () {
        it ('Contract owner can execute', async function () {
            await expect(hardhatToken.connect(owner).setMaxBurnMint(20))
            expect(await hardhatToken.maxBurnMint()).to.be.equal(20);
        })

        it ('Should be reverted if the caller is not owner', async function () {
            await expect(hardhatToken.connect(addr1).setMaxBurnMint(20)).to.be.revertedWith('Ownable: caller is not the owner');
        })
    });

    describe('setBaseURI', function () {
        it ('Contract owner can execute', async function () {
            const baseurl = 'ipfs://test.url/'
            await hardhatToken.connect(owner).setBaseURI(baseurl)
            await hardhatToken.connect(owner).pause(false);
            const overrides = {
                value: ethers.utils.parseEther('0.001'),
            }
            await hardhatToken.connect(addr1).mint(1, overrides)

            expect(await hardhatToken.baseURI()).to.be.equal(baseurl);
            expect(await hardhatToken.tokenURI(11)).to.be.equal(baseurl+'11.json');
        })

        it ('Should be reverted if the caller is not owner', async function () {
            const baseurl = 'ipfs://test.url/'
            await expect(hardhatToken.connect(addr1).setBaseURI(baseurl)).revertedWith('Ownable: caller is not the owner')
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
            await expect(hardhatToken.connect(addr1).withdraw()).revertedWith('Ownable: caller is not the owner')
        })

        it ('Can withdraw fund by the owner', async function () {
            await hardhatToken.connect(owner).pause(false)
            const overrides = {
                value: ethers.utils.parseEther('1')
            }
            await hardhatToken.connect(addr1).mint(5, overrides)

            withdrawAddress = '0x0195Fcc920EeE9a2726A5762B88720f6aC03a577'
            const accountBalanceBeforeWithdraw = ethers.utils.formatEther(
                await hardhatToken.provider.getBalance(withdrawAddress),
            )
            await hardhatToken.connect(owner).withdraw()
            const accountBalanceAfterWithdraw = ethers.utils.formatEther(
                await hardhatToken.provider.getBalance(withdrawAddress),
            )
            expect(parseInt(accountBalanceAfterWithdraw) > parseInt(accountBalanceBeforeWithdraw)).to.be.true
        })
    });

    describe('_startTokenId', function () {
        it ('', async function () {
            // TODO
        })
    });
})




// SPDX-License-Identifier: MIT

pragma solidity >=0.8.13 <0.9.0;

import "@fhenixprotocol/contracts/FHE.sol";
import {Permissioned, Permission} from "@fhenixprotocol/contracts/access/Permissioned.sol";

contract Spy is Permissioned {
    euint32 public secretRequirements; // encodes an array of 4 secret requirements, each 1 byte
    address[4] internal checkpointAddresses; // address[i] can set byte nubmer i starting from least significant
    address internal spyAddress;
    uint32 public constant BYTE_MASK = 255;

    event RequirementUpdated(address indexed checkpointAddress, uint8 indexed checkpointIndex);

    constructor(
        address _spyAddress,
        address checkpoint0,
        address checkpoint1,
        address checkpoint2,
        address checkpoint3
    ) {
        spyAddress = _spyAddress;
        checkpointAddresses[0] = checkpoint0;
        checkpointAddresses[1] = checkpoint1;
        checkpointAddresses[2] = checkpoint2;
        checkpointAddresses[3] = checkpoint3;
        secretRequirements = FHE.asEuint32(0); //  requirement is empty in the beginning
    }

    function setSecretRequirement(uint8 reqNum, inEuint32 calldata encryptedValue) public {
        require(reqNum < 4, "There are only 4 checkpoints, index out of bounds");
        require(
            checkpointAddresses[reqNum] == msg.sender, "Given checkpoint byte can not be accessed from this address"
        );
        euint32 secretReq32 = FHE.asEuint32(encryptedValue);
        secretReq32 = FHE.and(secretReq32, FHE.asEuint32(BYTE_MASK)); // truncates the passed value is just 1 byte
        uint32 mask = uint32(4294967295) ^ (uint32(255) << (8 * reqNum)); // mask to set to zero the previous requirement by this checkpoint
        euint32 shiftedSecretReq32 = FHE.shl(secretReq32, FHE.asEuint32(8 * reqNum));
        secretRequirements = FHE.and(secretRequirements, FHE.asEuint32(mask)); // set to zero the previous requirement by this checkpoint
        secretRequirements = FHE.or(secretRequirements, shiftedSecretReq32); // set the new requirement by this checkpoint
        emit RequirementUpdated(msg.sender, reqNum);
    }

    function getSecretRequirements(Permission memory permission)
        public
        view
        onlySender(permission)
        returns (string memory)
    {
        return FHE.sealoutput(secretRequirements, permission.publicKey);
    }
}

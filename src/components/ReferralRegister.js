import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

import config from "../config.json";

const ReferralRegister = () => {
	const [provider, setProvider] = useState(undefined);
	const [crowdsaleContract, setCrowdsaleContract] = useState(undefined);
	const [saleSettings, setSaleSettings] = useState(undefined);

	useEffect(() => {
		const init = async () => {
			const provider = new ethers.providers.JsonRpcProvider(config.endpoint);
			const crowdsaleContract = new ethers.Contract(config.crowdsaleAddress, config.crowdsaleAbi, provider);

			setProvider(provider);
			setCrowdsaleContract(crowdsaleContract);
		}
		init();
	}, [])

  return(
	<div>

	</div>
  )
}

export default ReferralRegister;
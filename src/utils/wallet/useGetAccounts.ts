/* eslint-disable  @typescript-eslint/no-unused-vars */
/* eslint-disable  @typescript-eslint/no-explicit-any */

'use client';

import { useEffect, useContext } from 'react';
import { quais } from 'quais';

import { DispatchContext } from '@/app/store';
import { dispatchAccount } from '@/utils/quaisUtils';

// ---- get accounts ---- //
// called in background on page load, gets user accounts and provider if pelagus is connected
// sets up accountsChanged listener to handle account changes

const useGetAccounts = () => {
  const dispatch = useContext(DispatchContext);
  useEffect(() => {
	const getAccounts = async (provider: any, accounts?: Array<string> | undefined) => {
  	let account;
  	await provider
    	.send('quai_accounts')
    	.then((accounts: Array<string>) => {
      	account = dispatchAccount(accounts, dispatch);
    	})
    	.catch((err: Error) => {
      	console.log('Error getting accounts.', err);
    	});
  	return account;
	};

	// Initialize the provider once the Pelagus extension has injected itself.
	const init = () => {
  	const pelagus = window.pelagus;
  	if (!pelagus) return;
  	const web3provider = new quais.BrowserProvider(pelagus);
  	dispatch({ type: 'SET_WEB3_PROVIDER', payload: web3provider });
  	getAccounts(web3provider);
  	pelagus.on('accountsChanged', (accounts: Array<string> | undefined) =>
    	dispatchAccount(accounts, dispatch)
  	);
	};

	// The extension injects window.pelagus asynchronously, so on a cold first
	// load it may not be present yet when this effect runs. Poll briefly for it
	// instead of checking only once (which caused a false "Install Pelagus").
	if (window.pelagus) {
  	init();
  	return;
	}

	dispatch({ type: 'SET_WEB3_PROVIDER', payload: undefined });
	let attempts = 0;
	const maxAttempts = 20; // ~3s at 150ms intervals
	const interval = setInterval(() => {
  	attempts += 1;
  	if (window.pelagus) {
    	clearInterval(interval);
    	init();
  	} else if (attempts >= maxAttempts) {
    	clearInterval(interval);
  	}
	}, 150);

	return () => clearInterval(interval);
	// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useGetAccounts;
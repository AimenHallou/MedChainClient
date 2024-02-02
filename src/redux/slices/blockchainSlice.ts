import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import Web3 from 'web3';

interface BlockChainState {
    account: string;
    hasMetaMask: boolean;
    web3?: Web3;
}

const initialState: BlockChainState = {
    account: '',
    hasMetaMask: true,
    web3: undefined,
};

const blockChainSlice = createSlice({
    name: 'blockchain',
    initialState,
    reducers: {
        updateHasMetaMask: (state, action: PayloadAction<boolean>) => {
            state.hasMetaMask = action.payload;
        },
        updateAccount: (state, action: PayloadAction<string>) => {
            state.account = action.payload;
        },
        updateWeb3: (state, action: PayloadAction<Web3>) => {
            state.web3 = action.payload;
        },
        connect: (state) => {
            const { ethereum } = window;
            const metamaskIsInstalled = ethereum && ethereum.isMetaMask;

            if (!metamaskIsInstalled) {
                state.hasMetaMask = false;
                return;
            }

            const web3 = new Web3(ethereum);
            web3.eth.setProvider(ethereum);

            //state.web3 = web3;

            try {
                ethereum.request({
                    method: 'eth_requestAccounts',
                });
            } catch (err) {
                console.error(err);
            }
        },
    },
});

export const { updateHasMetaMask, updateAccount, updateWeb3, connect } = blockChainSlice.actions;
export default blockChainSlice.reducer;

export const checkConnection = createAsyncThunk('blockchain/checkConnection', async (_, { dispatch }) => {
    const { ethereum } = window;

    if (!ethereum || !ethereum.isMetaMask) {
        dispatch(updateHasMetaMask(false));
        return;
    }

    const web3 = new Web3(ethereum);

    try {
        const accounts = await web3.eth.getAccounts();

        if (accounts.length > 0) {
            dispatch(updateAccount(accounts[0]));
        } else {
            dispatch(updateAccount(''));
        }

        ethereum.on('accountsChanged', (code) => {
            const newAccount = (code as string[])[0];

            if (newAccount) {
                dispatch(updateAccount(newAccount));
            } else {
                dispatch(updateAccount(''));
            }
        });
    } catch (error) {
        console.error('Error fetching accounts:', error);
    }
});

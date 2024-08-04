'use client';
import React, { useState, useEffect } from "react";
import { collection, addDoc, query, onSnapshot, doc, deleteDoc } from "firebase/firestore"; 
import { db } from "./firebase";

export default function Home() {
  const [accounts, setAccounts] = useState([]);
  const [newAccount, setNewAccount] = useState({ name: '', balance: '' });
  const [totalBalance, setTotalBalance] = useState(0);

  // Add account to database
  const addAccount = async (e) => {
    e.preventDefault();
    if (newAccount.name !== '' && newAccount.balance !== '') {
      await addDoc(collection(db, 'accounts'), {
        name: newAccount.name.trim(),
        balance: newAccount.balance,
      });
      setNewAccount({ name: '', balance: '' });
    }
  }

  // Read accounts from database
  useEffect(() => {
    const q = query(collection(db, 'accounts'));
    const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
      let accountsArr = [];

      QuerySnapshot.forEach((doc) => {
        accountsArr.push({ ...doc.data(), id: doc.id });
      });
      setAccounts(accountsArr);

      // Calculate total balance
      const calculateTotalBalance = () => {
        const total = accountsArr.reduce(
          (sum, account) => sum + parseFloat(account.balance),
          0
        );
        setTotalBalance(total);
      };
      calculateTotalBalance();
    });

    return () => unsubscribe();
  }, []);

  // Delete account from database
  const deleteAccount = async (id) => {
    await deleteDoc(doc(db, 'accounts', id));
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl p-4 text-center text-white font-bold">Banking Management System</h1>
        <div className="bg-white shadow-lg p-6 rounded-lg w-full max-w-2xl mx-auto">
          <form className="grid grid-cols-6 gap-4 items-center mb-4">
            <input 
              value={newAccount.name}
              onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
              className="col-span-3 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
              type="text"
              placeholder="Account Name"
            />
            <input 
              value={newAccount.balance}
              onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
              className="col-span-2 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
              type="number"
              placeholder="Balance"
            />
            <button
              onClick={addAccount}
              className="col-span-1 text-white bg-purple-600 hover:bg-purple-700 p-3 rounded transition-transform transform hover:scale-105"
              type="submit"
            >
              Add
            </button>            
          </form>
          <ul>
            {accounts.map((account) => (
              <li
                key={account.id}
                className="my-4 w-full flex justify-between bg-purple-100 rounded p-4 shadow"
              >
                <div className="w-full flex justify-between">
                  <span className="capitalize text-purple-700 font-semibold">{account.name}</span>
                   <span className="text-purple-700 font-semibold">${account.balance}</span>
                </div>
                <button 
                  onClick={() => deleteAccount(account.id)} 
                  className="text-purple-700 ml-8 p-2 border-l-2 border-purple-200 hover:bg-purple-200 rounded transition-colors"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          {accounts.length < 1 ? (
            <p className="text-lg mt-6 text-center text-gray-500">No accounts found</p>
          ) : (
            <div className="flex justify-between p-3 text-purple-700 font-semibold">
              <span>Total Balance</span>
              <span>${totalBalance}</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}



import { CompatibilityCheck } from './CompatibilityCheck.js'; // CompatibilityCheckのインポート
import { Field, Mina, PrivateKey, AccountUpdate, Poseidon } from 'o1js';

const useProof = false;
const Local = await Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);
const deployerAccount = Local.testAccounts[0];
const deployerKey = deployerAccount.key;
const user1Account = Local.testAccounts[1];
const user1Key = user1Account.key;
const user2Account = Local.testAccounts[2];
const user2Key = user2Account.key;

// ランダムな誕生日の数値を生成（例として）
const birthday1 = Field(20010615); // ユーザー1の誕生日
const birthday2 = Field(20010616); // ユーザー2の誕生日

// zkAppのセットアップ
const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();
const zkAppInstance = new CompatibilityCheck(zkAppAddress);

// スマートコントラクトのデプロイ
const deployTxn = await Mina.transaction(deployerAccount, async () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  await zkAppInstance.deploy();
});
await deployTxn.prove();
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

// ユーザー1の誕生日登録
const txn1 = await Mina.transaction(user1Account, async () => {
  await zkAppInstance.registerUser1BirthdayHash(birthday1);
});
await txn1.prove();
await txn1.sign([user1Key]).send();

// ユーザー2の誕生日登録
const txn2 = await Mina.transaction(user2Account, async () => {
  await zkAppInstance.registerUser2BirthdayHash(birthday2);
});
await txn2.prove();
await txn2.sign([user2Key]).send();

// 相性スコアの計算
const compatibilityTxn = await Mina.transaction(deployerAccount, async () => {
  await zkAppInstance.calculateCompatibility();
});
await compatibilityTxn.prove();
await compatibilityTxn.sign([deployerKey]).send();

// 相性スコアの取得
const compatibilityScore = await zkAppInstance.compatibilityScore.get();
console.log('Compatibility Score:', compatibilityScore.toString());

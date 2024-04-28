import { Field, SmartContract, state, State, method, Poseidon } from 'o1js';

export class CompatibilityCheck extends SmartContract {
  @state(Field) user1Hash = State<Field>();
  @state(Field) user2Hash = State<Field>();
  @state(Field) compatibilityScore = State<Field>(); // 相性スコア(hashの差）をステートとして保持


  // Register the birthday hash of the first user
  // 最初のユーザーの誕生日のハッシュを登録します
  @method async registerUser1BirthdayHash(birthday: Field) {
    this.user1Hash.set(Poseidon.hash([birthday]));
  }

  // Register the birthday hash of the second user
  // 二番目のユーザーの誕生日のハッシュを登録します
  @method async registerUser2BirthdayHash(birthday: Field) {
    this.user2Hash.set(Poseidon.hash([birthday]));
  }

  // Calculate the compatibility score based on the hash differences
  // ハッシュの差を基に相性スコアを計算します
  @method async calculateCompatibility() {
    const hash1 = await this.user1Hash.get();
    this.user1Hash.requireEquals(hash1);

    const hash2 = await this.user2Hash.get();
    this.user2Hash.requireEquals(hash2);

    // Calculate the difference between the hashes
    // ハッシュ値の差を計算します
    const difference = hash1.sub(hash2);

    // 更新された相性スコアをステートに設定
    await this.compatibilityScore.set(difference);
  }
}

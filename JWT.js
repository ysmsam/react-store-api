import jsonwebtoken from 'jsonwebtoken';
const secret = 'test_key';

export default class JWT {
  public static generate(value: any, expires = '7 days'): string { // value 为传入值， expires为过期时间，这两者都会在token字符串中题先
    try {
      return jsonwebtoken.sign(value, secret, { expiresIn: expires });
    } catch (e) {
      console.error('jwt sign error --->', e);
      return '';
    }
  }

  public static verify(token: string) {
    try {
      return jsonwebtoken.verify(token, secret); // 如果过期将返回false
    } catch (e) {
      console.error('jwt verify error --->', e);
      return false;
    }
  }
}
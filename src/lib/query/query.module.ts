import { BASE_URL, EApiActions } from '../../ressources/comon';
import { singleton } from 'tsyringe';
import axios from 'axios';
import { EApiErrors, RequestErrors } from '../../ressources/errors';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import 'dotenv/config';

@singleton()
export class Query {
  private apiKey: string | null;
  private agent: any;
  proxy({
    USE_PROXY_SMS_ACTIVATE,
    HOST_SMS_ACTIVATE,
    PORT_SMS_ACTIVATE,
    USER_SMS_ACTIVATE,
    PASS_SMS_ACTIVATE,
    PROTOCOL_SMS_ACTIVATE,
  }): any {
    return USE_PROXY_SMS_ACTIVATE
      ? PROTOCOL_SMS_ACTIVATE == 'http'
        ? new HttpsProxyAgent(
            `http://${USER_SMS_ACTIVATE}:${PASS_SMS_ACTIVATE}@${HOST_SMS_ACTIVATE}:${PORT_SMS_ACTIVATE}`
          )
        : new SocksProxyAgent(
            `socks5://${USER_SMS_ACTIVATE}:${PASS_SMS_ACTIVATE}@${HOST_SMS_ACTIVATE}:${PORT_SMS_ACTIVATE}`
          )
      : false;
  }
  async setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    this.agent = this.proxy(process.env as any);
  }

  makeCall(
    action: EApiActions,
    query?: Record<string, string | number | boolean>
  ): any {
    query = query || {};
    return new Promise<any>((resolve, reject) => {
      if (!this.apiKey) return reject(new Error(RequestErrors.MissingApiKey));
      const params = new URLSearchParams({
        api_key: this.apiKey,
        action: EApiActions[action],
        ...query,
      });
      axios
        .get(BASE_URL, {
          httpsAgent: this.agent,
          httpAgent: this.agent,
          params,
        })
        .then((result) => {
          if (typeof result.data == 'string' && EApiErrors[result.data])
            return reject(new Error(EApiErrors[result.data]));
          resolve(result.data);
        })
        .catch((error) => reject(error));
    });
  }
}

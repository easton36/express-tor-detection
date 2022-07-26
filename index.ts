import * as dns from 'dns';

// https://2019.www.torproject.org/projects/tordnsel.html.en
const TOR_DNS_LOOKUP_URL = "dnsel.torproject.org";

interface Config {
    block: boolean;
    userKey: string;
    errorMessage: string;
    redirect?: {
        clearNetDomain: string; // domain name for clearnet traffic
        torDomain: string; //domain name for tor traffic
        redirectClearNet: boolean; //redirect clearnet traffic if accessing from tor domain
        redirectTor: boolean; //redirect tor traffic if accessing from clearnet domain
    }
}

// reverse the sections of an ip address
const reverseIp = (ip: string) => ip.split(".").reverse().join(".");

// lookup the dns record for the target ip
const lookupDns = (ip: string): Promise<boolean> => new Promise((res, rej): void => {
    let reversedIp = reverseIp(ip);
    //lookup dns
    dns.lookup(`${reversedIp}.${TOR_DNS_LOOKUP_URL}`, (err: NodeJS.ErrnoException | null, address: string) => {
        if(err){
            if(err.code === 'ENOTFOUND'){
                return res(false);
            }
            return rej(err);
        }
        // TOR exit nodes return an interal ip address
        if(address.startsWith('127.0.0.')){
            return res(true);
        }

        return res(false);
    });
});

/**
 * Express middlewear to check if the request is from a tor exit node
 * @param {config} config
 * @returns {boolean} true if the request is from a tor exit node
*/
const middlewear = (config: Config = {
    block: false,
    userKey: 'isTor',
    errorMessage: 'You are not allowed to access this resource'
}) => async (req: any, res: any, next: any): Promise<void> => {
    // get the hostname from the request
    let ip: string = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // isolate ipv4 address from prefix
    if(ip.substring(0, 7) === '::ffff:'){
        ip = ip.substring(7);
    }
    //get hostname
    let hostname: string = req.hostname;

    // use dns lookup to get the hostname
    let isTor: boolean = await lookupDns(ip);
    // if the request is from a tor exit node
    if(config.block && isTor){
        return next(Error(config.errorMessage));
    }

    //manage redirects
    if(config.redirect){
        if(isTor && config.redirect.redirectTor && config.redirect.torDomain !== hostname){
            return res.redirect(`http://${config.redirect.torDomain}`);
        }
        if(!isTor && config.redirect.redirectClearNet && config.redirect.clearNetDomain !== hostname){
            return res.redirect(`http://${config.redirect.clearNetDomain}`);
        }
    }

    // add the user key to the request
    req[config.userKey] = isTor;

    next();
};

export = middlewear;
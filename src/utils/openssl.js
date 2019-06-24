import { spawn } from 'child_process'
import Config from '../config'


const OPENSSL_BIN = Config.opensslbin;

function runOpensslCommand(cmd, input) {
    return new Promise((resolve, reject) => {
        const openssl = spawn(OPENSSL_BIN, cmd);

        let outData = "";
        let errData = "";

        if(input !== undefined) {
            openssl.stdin.write(input);
            openssl.stdin.end();
        }

        openssl.stdout.on('data', data => {
            outData += data.toString();
        });
        openssl.stderr.on('data', data=>{
            errData += data.toString();
        });
        openssl.on('exit', code => {
            if(code == null) code = 0;
            if(code != 0){
                reject({
                    errData,
                    code
                });
            }else{
                resolve({
                    outData,
                    errData,
                    code
                });
            }
        });
    });
}

export async function getRSAPrivateKey() {
    const genpkeyArgs = ['genpkey', '-outform', 'PEM', '-algorithm', 'RSA', '-pkeyopt', 'rsa_keygen_bits:2048'];
    return await runOpensslCommand(genpkeyArgs);
}

export async function getRSAPublicKeyFromKeypair(keypair) {
    const getpubkeyArgs = ['rsa', '-in', '-', '-pubout'];
    return await runOpensslCommand(getpubkeyArgs, keypair);
}
import { exec } from "child_process";
import { GitAddError, GitCommitError, GitLSRemoteError, GitPushError } from "errors";
import { App, FileSystemAdapter } from "obsidian";

function runCommand(command: string, filePath: string): Promise<string>
{
    return new Promise((resolve, reject) =>
    {
        exec(command, { cwd: filePath, shell: 'bash' },(error, stdout, stderr) => 
        {
            if (error)
            {
                reject(error);
                return;
            }
            if (stderr)
            {
                console.error(`stderr: ${stderr}`);
            }
            resolve(stdout);
        });
    });
}

function getVaultPath(app: App)
{
    let adapter = app.vault.adapter;
    if (adapter instanceof FileSystemAdapter)
    {
        const vaultPath = adapter.getBasePath();
        return vaultPath;
    }
    return null;
}

export async function commitAndPush(commitMessage: string, app: App): Promise<string>
{
    return new Promise(async (resolve, reject) => 
    {
        try
        {
            const vaultPath = getVaultPath(app);

            if (!vaultPath)
            {
                throw "Couldn't get vault path";
            }

            await runCommand("git ls-remote", vaultPath)
                    .then(res => 
                    {
                        // User has access to repo
                    })
                    .catch(err =>
                    {
                        throw GitLSRemoteError;
                    });

            await runCommand(`git add .`, vaultPath)
                    .then(res =>
                    {
                        // Changes have been staged
                    })
                    .catch(err =>
                    {
                        throw GitAddError;
                    });

            await runCommand(`git commit -m "${commitMessage}"`, vaultPath)
                    .then(res =>
                    {

                    })
                    .catch(err => 
                    {
                        throw GitCommitError;
                    });

            await runCommand("git push -u origin main", vaultPath)
                    .then(res =>
                    {

                    })
                    .catch(err =>
                    {
                        throw GitPushError;
                    });

            resolve("Successful");
        }

        catch (error)
        {
            reject(error);
            return;
        }
    });
}
import { App, Modal, Notice, Setting } from "obsidian";
import { commitAndPush } from "commands";
import { GitAddError, GitCommitError, GitLSRemoteError, GitPushError } from "errors";

export class CommitModal extends Modal
 {
    commitMessage: string;

	constructor(app: App) 
    {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.createEl("h3", { text: "Commit to a remote repository" });
        contentEl.createEl("p", { text: "Enter a commit message and click the button to commit your changes to a remote repository."});

        new Setting(contentEl)
            .setName("Commit Message")
            .addText((text) =>
            {
                text.onChange(value =>
                {  
                    this.commitMessage = value;
                });
            })

        new Setting(contentEl)
            .addButton((btn) => 
                btn
                    .setButtonText("Commit")
                    .setCta()
                    .onClick(async () => 
                    {
                        let spinnerDiv = contentEl.createEl("div", { cls: "spinner-div"})
                        spinnerDiv.createEl("span", { cls: "spinner" });

                        await commitAndPush(this.commitMessage, this.app)
                            .then(result =>
                            {
                                spinnerDiv.remove();
                                contentEl.createEl("p", { text: "Commit Successful", cls: "commit-success" });
                            })
                            .catch(err =>
                            {  
                                spinnerDiv.remove();
                                if (err instanceof GitLSRemoteError)
                                {
                                    contentEl.createEl("p", { text: "Couldn't access remote repository", cls: "commit-warning" });
                                }
                                else if (err instanceof GitAddError)
                                {
                                    contentEl.createEl("p", { text: "Couldn't perform git add", cls: "commit-warning" });
                                }
                                else if (err instanceof GitCommitError)
                                {
                                    contentEl.createEl("p", { text: "Couldn't commit to repository", cls: "commit-warning" });
                                }
                                else if (err instanceof GitPushError)
                                {
                                    contentEl.createEl("p", { text: "Couldn't push to remote repository", cls: "commit-warning" });
                                }
                                else
                                {
                                    contentEl.createEl("p", { text: "Unspecified error", cls: "commit-warning" });
                                }
                            });

                        (new Promise(resolve => {setTimeout(resolve, 3000)})).then(() => { this.close();});
                    }))
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
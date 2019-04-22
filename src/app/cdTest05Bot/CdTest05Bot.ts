import { BotDeclaration, MessageExtensionDeclaration, IBot, PreventIframe } from "express-msteams-host";
import * as debug from "debug";
import { DialogSet, DialogState } from "botbuilder-dialogs";
import { StatePropertyAccessor, CardFactory, TurnContext, MemoryStorage, ConversationState, ActivityTypes } from "botbuilder";
import HelpDialog from "./dialogs/HelpDialog";
import WelcomeCard from "./dialogs/WelcomeDialog";
import CdTest05MessageExtension from "../cdTest05MessageExtension/CdTest05MessageExtension";
import { TeamsContext, TeamsActivityProcessor } from "botbuilder-teams";

// Initialize debug logging module
const log = debug("msteams");

/**
 * Implementation for cd test 05 Bot
 */
@BotDeclaration(
    "/api/messages",
    new MemoryStorage(),
    process.env.MICROSOFT_APP_ID,
    process.env.MICROSOFT_APP_PASSWORD)
@PreventIframe("/cdTest05Bot/asdasdasd.html")
export class CdTest05Bot implements IBot {
    private readonly conversationState: ConversationState;
    /**
     * Local property for CdTest05MessageExtension
     */
    @MessageExtensionDeclaration("cdTest05MessageExtension")
    private _cdTest05MessageExtension: CdTest05MessageExtension;
    private readonly dialogs: DialogSet;
    private dialogState: StatePropertyAccessor<DialogState>;
    private readonly activityProc = new TeamsActivityProcessor();

    /**
     * The constructor
     * @param conversationState
     */
    public constructor(conversationState: ConversationState) {
        // Message extension CdTest05MessageExtension
        this._cdTest05MessageExtension = new CdTest05MessageExtension();

        this.conversationState = conversationState;
        this.dialogState = conversationState.createProperty("dialogState");
        this.dialogs = new DialogSet(this.dialogState);
        this.dialogs.add(new HelpDialog("help"));

        // Set up the Activity processing

        this.activityProc.messageActivityHandler = {
            // Incoming messages
            onMessage: async (context: TurnContext): Promise<void> => {
                // get the Microsoft Teams context, will be undefined if not in Microsoft Teams
                const teamsContext: TeamsContext = TeamsContext.from(context);

                // TODO: add your own bot logic in here
                switch (context.activity.type) {
                    case ActivityTypes.Message:
                        const text = teamsContext ?
                            teamsContext.getActivityTextWithoutMentions().toLowerCase() :
                            context.activity.text;

                        if (text.startsWith("hello")) {
                            await context.sendActivity("Oh, hello to you as well!");
                            return;
                        } else if (text.startsWith("help")) {
                            const dc = await this.dialogs.createContext(context);
                            await dc.beginDialog("help");
                        } else {
                            await context.sendActivity(`I\'m terribly sorry, but my master hasn\'t trained me to do anything yet...`);
                        }
                        break;
                    case ActivityTypes.ConversationUpdate:
                        log("Conversation update");
                        // Display a welcome card when the bot is added to a conversation
                        if (context.activity.membersAdded && context.activity.membersAdded.length !== 0) {
                            for (const idx in context.activity.membersAdded) {
                                if (context.activity.membersAdded[idx].id !== context.activity.recipient.id) {
                                    const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
                                    await context.sendActivity({ attachments: [welcomeCard] });
                                }
                            }
                        }
                        break;
                    default:
                        break;
                }

                // Save state changes
                return this.conversationState.saveChanges(context);
            }
        };

        // Message reactions in Microsoft Teams
        this.activityProc.messageReactionActivityHandler = {
            onMessageReaction: async (context: TurnContext): Promise<void> => {
                const added = context.activity.reactionsAdded;
                if (added && added[0]) {
                    await context.sendActivity({
                        textFormat: "xml",
                        text: `That was an interesting reaction (<b>${added[0].type}</b>)`
                    });
                }
            }
        };
    }

    /**
     * The Bot Framework `onTurn` handlder.
     * The Microsoft Teams middleware for Bot Framework uses a custom activity processor (`TeamsActivityProcessor`)
     * which is configured in the constructor of this sample
     */
    public async onTurn(context: TurnContext): Promise<any> {
        // transfer the activity to the TeamsActivityProcessor
        await this.activityProc.processIncomingActivity(context);
    }
}

import { BareUser, getTagText, BareTag, BareMessage } from "./bare";
import { IdName } from "../data";
import * as Post from "../shared/post";
import * as crypto from "crypto";

/*
  These are the types of data posted by users which may be stored on disk.
  They're a "discriminated union" of types so they can be easily reloaded.

  See also:
  
  - "../shared/post" which defines these types on the wire between client and server.
  - "./bare" which defines the data on disk after it's aggregated into a collection.

  They're constructed by adding server-side data to data that's posted by the client.
*/

// this defines the basic data that's contained in every action
// most data types also have a server-side ID added
interface ActionT<TType extends string, TPosted> {
  // the type of action (so this is a discriminated union)
  type: TType;
  // received from the client
  posted: TPosted;
  // added at the server
  dateTime: string;
  userId: number;
}

/*
  NewTopic
*/

export type NewTopic = ActionT<"NewTopic", Post.NewTopic>;

export function createNewTopic(
  posted: Post.NewTopic,
  dateTime: string, userId: number)
  : NewTopic {
  return { type: "NewTopic", posted, dateTime, userId }
}

export function extractNewTopic(action: NewTopic): BareTag {
  const { dateTime, userId } = action;
  const key = getTagText(action.posted.title);
  return { ...action.posted, dateTime, userId, key };
}

/*
  NewUser
*/

export type NewUser = ActionT<"NewUser", Post.NewUser>;

export function createNewUser(
  posted: Post.NewUser,
  dateTime: string, userId: number)
  : NewUser {
  return { type: "NewUser", posted, dateTime, userId }
}

function md5(email: string): string {
  return crypto.createHash('md5').update(email).digest('hex');
}

export function extractNewUser(action: NewUser): { userId: number, user: BareUser } {
  const { dateTime, userId } = action;
  const { name, email } = action.posted;
  // https://en.gravatar.com/site/implement/hash/
  // https://stackoverflow.com/questions/5878682/node-js-hash-string
  const gravatarHash = md5(email.trim().toLocaleLowerCase());
  const user: BareUser = { name, email, dateTime, gravatarHash, profile: {}, favourites: [] };
  return { userId, user };
}

/*
  NewUserProfile
*/

export type NewUserProfile = ActionT<"NewUserProfile", Post.NewUserProfile>;

export function createNewUserProfile(
  posted: Post.NewUserProfile,
  dateTime: string, userId: number)
  : NewUserProfile {
  return { type: "NewUserProfile", posted, dateTime, userId }
}

export function extractNewUserProfile(action: NewUserProfile): { userId: number, posted: Post.NewUserProfile } {
  const { userId, posted } = action;
  return { userId, posted };
}

/*
  NewDiscussion
*/

export type NewDiscussion = ActionT<"NewDiscussion", Post.NewDiscussion> & { discussionId: number, messageId: number };

export function createNewDiscussion(
  posted: Post.NewDiscussion,
  dateTime: string, userId: number,
  // created by the server database
  discussionId: number,
  // created by the server database
  messageId: number)
  : NewDiscussion {
  return { type: "NewDiscussion", posted, dateTime, userId, discussionId, messageId }
}

export function extractNewDiscussion(action: NewDiscussion): { idName: IdName, tags: string[], first: BareMessage } {
  const { dateTime, userId, discussionId, messageId } = action;
  const { title, markdown, tags } = action.posted;
  const first: BareMessage = { dateTime, userId, messageId, markdown };
  const idName: IdName = { id: discussionId, name: title };
  return { idName, tags, first };
}

/*
  NewMessage
*/

export type NewMessage = ActionT<"NewMessage", Post.NewMessage> & { messageId: number, discussionId: number };

export function createNewMessage(
  posted: Post.NewMessage,
  dateTime: string, userId: number,
  // carried in the URL
  discussionId: number,
  // created by the server database
  messageId: number)
  : NewMessage {
  return { type: "NewMessage", posted, dateTime, userId, messageId, discussionId }
}

export function extractNewMessage(action: NewMessage): { discussionId: number, message: BareMessage } {
  const { dateTime, userId, discussionId, messageId } = action;
  const { markdown } = action.posted;
  const message: BareMessage = { dateTime, userId, messageId, markdown };
  return { discussionId, message };
}

/*
  Any
*/

export type Any = NewTopic | NewUser | NewUserProfile | NewMessage | NewDiscussion;

export function getLoadPriority(action: Any): number {
  switch (action.type) {
    case "NewUser": return 1;
    case "NewUserProfile": return 2;
    case "NewTopic": return 3;
    case "NewDiscussion": return 4;
    case "NewMessage": return 5;
    default:
      throw new Error(`Unhandled type`);
  }
}

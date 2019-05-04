import * as I from "../data";

export const siteMap: I.SiteMap = {
  images: [
    {
      idName: { id: 1, name: "Mappa Mundi" },
      summary: `This is a very interesting map, worthy of much discussion.

And this description of it has two paragraphs, with some **bold** text,
so you can see this text can be formatted -- it's actually created in one of the
[Markdown](https://en.wikipedia.org/wiki/Markdown) formats.`
    }
  ]
};

export const loginUser: I.UserSummary = {
  idName: { id:1, name:"JohnS"},
  gravatarHash: "75bfdecf63c3495489123fe9c0b833e1",
  location: "London"
}
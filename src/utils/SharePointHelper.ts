import { SPFI } from "@pnp/sp";
import { IWeb } from "@pnp/sp/webs";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups/web";
import { ISiteUserInfo } from "@pnp/sp/site-users/types";
import { ISiteGroupInfo } from "@pnp/sp/site-groups/types";
import { INavigationItem } from "../extensions/globalNavigationBar/INavigationItem";

export default class SharePointHelper {
  private web: IWeb;

  constructor(sp: SPFI) {
    this.web = sp.web;
  }

  public async getListItems(listTitle: string, fields: string[]): Promise<INavigationItem[]> {
    const items = await this.web.lists.getByTitle(listTitle).items.select(...fields)();
    return items as INavigationItem[];
  }

  public async getCurrentUser(): Promise<ISiteUserInfo> {
    return this.web.currentUser();
  }

  public async getAllSiteGroups(): Promise<ISiteGroupInfo[]> {
    return this.web.siteGroups();
  }

  public async getGroupUsers(groupId: number): Promise<ISiteUserInfo[]> {
    return this.web.siteGroups.getById(groupId).users();
  }
}

import { SPFI } from "@pnp/sp";
import { ISiteUserInfo } from "@pnp/sp/site-users/types";
import { ISiteGroupInfo } from "@pnp/sp/site-groups/types";
import { INavigationItem } from "../extensions/globalNavigationBar/INavigationItem";
import SharePointHelper from "../utils/SharePointHelper";

export default class NavigationService {
  private helper: SharePointHelper;

  constructor(sp: SPFI) {
    this.helper = new SharePointHelper(sp);
  }

  // Fetch and return navigation items sorted by 'Order' property
  public async getNavigationItems(): Promise<INavigationItem[]> {
    const items = await this.helper.getListItems("GlobalNavigationLinks", ["Title", "URL", "Order", "Category", "SecurityGroup"]);
    return items.sort((a, b) => a.Order - b.Order);
  }

  // Fetch and return the current user
  public async getCurrentUser(): Promise<ISiteUserInfo> {
    return this.helper.getCurrentUser();
  }

  // Fetch and return all site groups
  public async getAllSiteGroups(): Promise<ISiteGroupInfo[]> {
    return this.helper.getAllSiteGroups();
  }

  // Fetch and return users in a specific group by group ID
  public async getGroupUsers(groupId: number): Promise<ISiteUserInfo[]> {
    return this.helper.getGroupUsers(groupId);
  }
}

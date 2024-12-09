import { BaseApplicationCustomizer, PlaceholderName } from "@microsoft/sp-application-base";
import { spfi, SPFx, SPFI } from "@pnp/sp";
import NavigationService from "../../services/NavigationService";
import styles from "./styles/GlobalNavigationBar.module.scss";
import { ISiteGroupInfo } from "@pnp/sp/site-groups/types";
import { INavigationItem } from "./INavigationItem";

/**
 * Interface for defining properties of the Global Navigation Bar Application Customizer.
 */
export interface IGlobalNavigationBarProperties {
  Top: string; // Placeholder for top navigation bar
}

/**
 * The main Application Customizer class for rendering a global navigation bar in SharePoint.
 */
export default class GlobalNavigationBarApplicationCustomizer extends BaseApplicationCustomizer<IGlobalNavigationBarProperties> {
  private navigationService: NavigationService; // Service for fetching navigation data

  /**
   * Initializes the Application Customizer.
   * Sets up the SPFx context and calls the method to render the mega menu.
   */
  public async onInit(): Promise<void> {
    console.log("Global Navigation Bar Extension Initialized!");

    // Initialize the PnP SP object with the current context
    const sp: SPFI = spfi().using(SPFx(this.context));
    this.navigationService = new NavigationService(sp);

    // Call the method to render the mega menu
    await this.renderMegaMenu();
  }

  /**
   * Fetches navigation items and renders the mega menu based on user permissions.
   */
  private async renderMegaMenu(): Promise<void> {
    try {
      console.log("Fetching items from SharePoint list: GlobalNavigationLinks");

      // Fetch navigation items from the SharePoint list
      const items = await this.navigationService.getNavigationItems();
      if (items.length === 0) {
        console.warn("No items found in the GlobalNavigationLinks list.");
        return;
      }

      // Fetch the current user details
      const currentUser = await this.navigationService.getCurrentUser();

      // Fetch all site groups
      const allGroups = await this.navigationService.getAllSiteGroups();

      // Determine the groups the current user belongs to
      const userGroupTitles = (await Promise.all(
        allGroups.map(async (group: ISiteGroupInfo) => {
          const groupUsers = await this.navigationService.getGroupUsers(group.Id);
          return groupUsers.some(user => user.Id === currentUser.Id) ? group.Title : null;
        })
      )).filter((title): title is string => title !== null); // Filter out null values

      // Filter navigation items based on the user's group membership
      const visibleItems = items.filter(item => !item.SecurityGroup || userGroupTitles.includes(item.SecurityGroup));

      if (visibleItems.length === 0) {
        console.warn("No visible navigation links for the current user.");
        return;
      }

      // Render the HTML for the mega menu
      this.renderMenuHtml(visibleItems);
    } catch (error) {
      console.error("Error fetching navigation links or rendering the mega menu:", error);
    }
  }

  /**
   * Renders the mega menu HTML and inserts it into the top placeholder.
   * 
   * @param items - Array of navigation items to display.
   */
  private renderMenuHtml(items: INavigationItem[]): void {
    // Group navigation items by their category
    const groupedLinks = items.reduce((grouped, item) => {
      grouped[item.Category] = grouped[item.Category] || [];
      grouped[item.Category].push(item);
      return grouped;
    }, {} as Record<string, INavigationItem[]>);

    // Construct the HTML structure for the mega menu
    let navBarHtml = `<nav class="${styles.megaMenu}">`;

    // Iterate over each category and create buttons and links
    Object.keys(groupedLinks).forEach(category => {
      navBarHtml += `
        <div class="${styles.megaMenuItem}">
          <button class="${styles.megaMenuButton}">${category}</button>
          <div class="${styles.megaMenuContent}">
            <div class="${styles.megaMenuColumns}">
              <ul>`;
      
      // Add each link under the current category
      groupedLinks[category].forEach(link => {
        navBarHtml += `<li><a href="${link.URL.Url}" class="${styles.navLink}">${link.Title}</a></li>`;
      });

      navBarHtml += `</ul>
            </div>
          </div>
        </div>`;
    });

    navBarHtml += `</nav>`;

    // Insert the mega menu HTML into the top placeholder
    const topPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top);
    if (topPlaceholder) {
      topPlaceholder.domElement.innerHTML = navBarHtml;
    } else {
      console.warn("Top placeholder not found. Mega menu will not be rendered.");
    }
  }
}

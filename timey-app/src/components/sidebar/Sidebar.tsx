import { sidebarNavGroups } from "@/features/dashboard/components/sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "../ui/sidebar";

export const AppSidebar = ({
  setActiveView,
}: {
  setActiveView: (view: string) => void;
}) => {
  const { state } = useSidebar();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex flex-row items-center justify-between">
        {state === "expanded" && (
          <h1 className="text-lg font-bold font-inconsolata">Timey</h1>
        )}
        <SidebarTrigger />
      </SidebarHeader>

      <SidebarContent>
        {sidebarNavGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className=" font-inconsolata">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveView(item.id)}
                      className=" hover:cursor-pointer"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span className=" font-firacode">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

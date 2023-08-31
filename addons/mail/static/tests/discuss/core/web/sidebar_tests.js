/* @odoo-module */

import { Command } from "@mail/../tests/helpers/command";
import { click, contains, insertText, start, startServer } from "@mail/../tests/helpers/test_utils";

QUnit.module("discuss sidebar");

QUnit.test("sidebar find shows channels matching search term", async () => {
    const pyEnv = await startServer();
    pyEnv["discuss.channel"].create({
        channel_member_ids: [],
        channel_type: "channel",
        group_public_id: false,
        name: "test",
    });
    const { openDiscuss } = await start();
    openDiscuss();
    await click(".o-mail-DiscussSidebarCategory-add:eq(0)");
    await insertText(".o-discuss-ChannelSelector input", "test");
    // When searching for a single existing channel, the results list will have at least 2 lines:
    // One for the existing channel itself
    // One for creating a channel with the search term
    await contains(".o-mail-NavigableList-item", { count: 2 });
    await contains(".o-mail-NavigableList-item", { text: "test" });
    await contains(".o-mail-NavigableList-item", { text: "Create: # test" });
});

QUnit.test(
    "sidebar find shows channels matching search term even when user is member",
    async () => {
        const pyEnv = await startServer();
        pyEnv["discuss.channel"].create({
            channel_member_ids: [Command.create({ partner_id: pyEnv.currentPartnerId })],
            channel_type: "channel",
            group_public_id: false,
            name: "test",
        });
        const { openDiscuss } = await start();
        openDiscuss();
        await click(".o-mail-DiscussSidebarCategory-add:eq(0)");
        await insertText(".o-discuss-ChannelSelector input", "test");
        // When searching for a single existing channel, the results list will have at least 2 lines:
        // One for the existing channel itself
        // One for creating a channel with the search term
        await contains(".o-mail-NavigableList-item", { count: 2 });
        await contains(".o-mail-NavigableList-item", { text: "test" });
        await contains(".o-mail-NavigableList-item", { text: "Create: # test" });
    }
);

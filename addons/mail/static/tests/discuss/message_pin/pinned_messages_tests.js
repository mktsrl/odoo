/* @odoo-module */

import { click, contains, start, startServer } from "@mail/../tests/helpers/test_utils";

import { nextTick, patchWithCleanup } from "@web/../tests/helpers/utils";

QUnit.module("pinned messages");

QUnit.test("Pin message", async () => {
    const pyEnv = await startServer();
    const channelId = pyEnv["discuss.channel"].create({ name: "General" });
    pyEnv["mail.message"].create({
        body: "Hello world!",
        model: "discuss.channel",
        res_id: channelId,
    });
    const { openDiscuss } = await start();
    openDiscuss(channelId);
    await click(".o-mail-Discuss-header button[title='Pinned Messages']");
    await contains(
        ".o-discuss-PinnedMessagesPanel:contains(This channel doesn't have any pinned messages.)"
    );
    await click(".o-mail-Message [title='Expand']");
    await click(".dropdown-item", { text: "Pin" });
    await click(".modal-footer button", { text: "Yeah, pin it!" });
    await contains(".o-discuss-PinnedMessagesPanel .o-mail-Message-content", {
        text: "Hello world!",
    });
});

QUnit.test("Unpin message", async () => {
    const pyEnv = await startServer();
    const channelId = pyEnv["discuss.channel"].create({ name: "General" });
    pyEnv["mail.message"].create({
        body: "Hello world!",
        model: "discuss.channel",
        res_id: channelId,
        pinned_at: "2023-03-30 11:27:11",
    });
    const { openDiscuss } = await start();
    openDiscuss(channelId);
    await click(".o-mail-Discuss-header button[title='Pinned Messages']");
    await contains(".o-discuss-PinnedMessagesPanel .o-mail-Message");
    await click(".o-mail-Message [title='Expand']");
    await click(".dropdown-item", { text: "Unpin" });
    await click(".modal-footer button", { text: "Yes, remove it please" });
    await contains(".o-discuss-PinnedMessagesPanel .o-mail-Message", { count: 0 });
});

QUnit.test("Deleted messages are not pinned", async () => {
    const pyEnv = await startServer();
    const channelId = pyEnv["discuss.channel"].create({ name: "General" });
    pyEnv["mail.message"].create({
        body: "Hello world!",
        message_type: "comment",
        model: "discuss.channel",
        res_id: channelId,
        pinned_at: "2023-03-30 11:27:11",
    });
    const { openDiscuss } = await start();
    openDiscuss(channelId);
    await click(".o-mail-Discuss-header button[title='Pinned Messages']");
    await contains(".o-discuss-PinnedMessagesPanel .o-mail-Message");
    await click(".o-mail-Message [title='Expand']");
    await click(".dropdown-item", { text: "Delete" });
    await click("button", { text: "Confirm" });
    await contains(".o-discuss-PinnedMessagesPanel .o-mail-Message", { count: 0 });
});

QUnit.test("Open pinned panel from notification", async () => {
    const pyEnv = await startServer();
    const channelId = pyEnv["discuss.channel"].create({ name: "General" });
    pyEnv["mail.message"].create({
        body: "Hello world!",
        model: "discuss.channel",
        res_id: channelId,
    });
    const { openDiscuss } = await start();
    openDiscuss(channelId);
    await click(".o-mail-Message:eq(0) [title='Expand']");
    await click(".dropdown-item", { text: "Pin" });
    await click(".modal-footer button", { text: "Yeah, pin it!" });
    await contains(".o-discuss-PinnedMessagesPanel", { count: 0 });
    await click(".o_mail_notification a", { text: "See all pinned messages" });
    await contains(".o-discuss-PinnedMessagesPanel");
});

QUnit.test("Jump to message", async (assert) => {
    // make scroll behavior instantaneous.
    patchWithCleanup(Element.prototype, {
        scrollIntoView() {
            return super.scrollIntoView(true);
        },
    });
    const pyEnv = await startServer();
    const channelId = pyEnv["discuss.channel"].create({ name: "General" });
    pyEnv["mail.message"].create({
        body: "Hello world!",
        model: "discuss.channel",
        res_id: channelId,
        pinned_at: "2023-04-03 08:15:04",
    });
    for (let i = 0; i < 20; i++) {
        pyEnv["mail.message"].create({
            body: "Non Empty Body ".repeat(25),
            message_type: "comment",
            model: "discuss.channel",
            res_id: channelId,
        });
    }
    const { openDiscuss } = await start();
    openDiscuss(channelId);
    await click(".o-mail-Discuss-header button[title='Pinned Messages']");
    await click(".o-discuss-PinnedMessagesPanel button", { text: "Jump" });
    await nextTick();
    assert.isVisible($(".o-mail-Message:contains(Hello world!)"));
});

QUnit.test("Jump to message from notification", async (assert) => {
    // make scroll behavior instantaneous.
    patchWithCleanup(Element.prototype, {
        scrollIntoView() {
            return super.scrollIntoView(true);
        },
    });
    const pyEnv = await startServer();
    const channelId = pyEnv["discuss.channel"].create({ name: "General" });
    pyEnv["mail.message"].create({
        body: "Hello world!",
        model: "discuss.channel",
        res_id: channelId,
    });
    for (let i = 0; i < 20; i++) {
        pyEnv["mail.message"].create({
            body: "Non Empty Body ".repeat(25),
            message_type: "comment",
            model: "discuss.channel",
            res_id: channelId,
        });
    }
    const { openDiscuss } = await start();
    openDiscuss(channelId);
    await click(".o-mail-Message:eq(0) [title='Expand']");
    await click(".dropdown-item", { text: "Pin" });
    await click(".modal-footer button", { text: "Yeah, pin it!" });
    await click(".o_mail_notification a:contains(message):eq(0)");
    await nextTick();
    assert.isVisible($(".o-mail-Message:contains(Hello world!)"));
});

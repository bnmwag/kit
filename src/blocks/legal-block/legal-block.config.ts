import { defineArrayMember, defineField, defineType } from "sanity";
import { baseBlock } from "../base-block";

export const legalBlockConfig = defineType({
    name: "legal",
    title: "Legal",
    type: "object",
    fields: [
        defineField({
            name: "title",
            type: "string",
        }),
        defineField({
            name: "lastUpdated",
            title: "Last updated",
            type: "date",
        }),
        defineField({
            name: "body",
            type: "array",
            of: [
                defineArrayMember({
                    type: "block",
                    styles: [
                        { title: "Normal", value: "normal" },
                        { title: "H2", value: "h2" },
                        { title: "H3", value: "h3" },
                    ],
                    lists: [
                        { title: "Bullet", value: "bullet" },
                        { title: "Number", value: "number" },
                    ],
                    marks: {
                        decorators: [
                            { title: "Strong", value: "strong" },
                            { title: "Emphasis", value: "em" },
                            { title: "Code", value: "code" },
                        ],
                        annotations: [
                            defineField({
                                name: "link",
                                type: "object",
                                title: "Link",
                                fields: [
                                    defineField({
                                        name: "href",
                                        type: "url",
                                        title: "URL",
                                        validation: (Rule) =>
                                            Rule.uri({
                                                allowRelative: true,
                                                scheme: ["http", "https", "mailto", "tel"],
                                            }),
                                    }),
                                ],
                            }),
                        ],
                    },
                }),
            ],
        }),
        ...baseBlock,
    ],
    preview: {
        select: { title: "title" },
        prepare({ title }) {
            return {
                title,
                subtitle: "Legal Block",
            };
        },
    },
});

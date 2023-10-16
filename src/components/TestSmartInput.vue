<template>
    <SmartInput :data="demo" />
</template>

<script setup lang="ts">
import SmartInput from "./SmartInput.vue";

export interface FlexibleInput {
    id: string;
    name: string;
    label: string;
    type: 'dropdown' | 'option' | 'number' | 'text' | 'checkbox' | 'slider';
    //parent: string;
    //value: null | string | number;
    children?: FlexibleInput[];
    // is type == 'text' or 'number' then this is the unit
    // unit?: (this['type'] extends 'number' | 'text' ? string : undefined);
    // equivalent?: (this['type'] extends 'number' | 'text' ? string : undefined);
}

const demo: FlexibleInput[] = [
    {
        id: "1",
        name: "flotte",
        label: "Flottenverbauch",
        type: 'dropdown',
        children: [
            {
                id: "21",
                name: "benzin",
                label: "Benzin",
                type: 'option',
                children: [
                    {
                        id: "211",
                        name: "benzin_small",
                        label: "Benzin klein",
                        type: 'option',
                    },
                    {
                        id: "212",
                        name: "benzin_medium",
                        label: "Benzin mittel",
                        type: 'option',

                    },
                ]
            },
            {
                id: "22",
                name: "diesel",
                label: "Diesel",
                type: 'option',
                children: [
                    {
                        id: "221",
                        name: "diesel_big",
                        label: "Diesel groß",
                        type: 'number',
                    },
                    {
                        id: "222",
                        name: "diesel_small",
                        label: "Diesel klein",
                        type: 'number',
                    },
                ]
            },
        ]
    }
];
</script>
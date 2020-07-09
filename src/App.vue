<template>
    <div id="app">
        <Home v-if="isHomeShown" @convert="$refs.file_input.click()" />
        <Files v-if="isFilesShown" v-model="files" @convert_more="$refs.file_input.click()" />
        <footer>
            <a href="https://github.com/gruppe-adler/paa.gruppe-adler.de#privacy" target="_balnk" rel="noreferrer">Privacy Policy</a>
            <a href="https://www.gruppe-adler.de" target="_blank" rel="noreferrer" style="opacity: 1;">www.gruppe-adler.de</a>
            <a href="https://github.com/gruppe-adler/paa.gruppe-adler.de/issues/new" target="_blank" rel="noreferrer">
                <i class="material-icons">bug_report</i>
                <span>Having Issues?</span>
            </a>
        </footer>
        <Overlay @input="onOverlayInput"></Overlay>
        <input
            ref="file_input"
            style="display: none"
            type="file"
            multiple
            accept="image/*,.paa"
            @input="onFileInput"
        />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import HomeVue from '@/components/Home.vue';
import FilesVue from '@/components/Files.vue';
import OverlayVue from '@/components/Overlay.vue';

import { isSupportedFile } from '@/utils/file';

@Component({
    components: {
        Home: HomeVue,
        Files: FilesVue,
        Overlay: OverlayVue
    }
})
export default class AppVue extends Vue {
    private files: File[] = [];

    private onOverlayInput (files: FileList) {
        const input = this.$refs.file_input as HTMLInputElement|undefined;
        if (!input) return;

        input.files = files;

        this.onFileInput();
    }

    private onFileInput () {
        const input = this.$refs.file_input as HTMLInputElement|undefined;
        if (!input) return;

        if (!input.files) return;
        if (input.files.length === 0) return;

        const newFiles = Array.from(input.files).filter(isSupportedFile);

        if (newFiles.length === 0) {
            if (input.files.length === 1) {
                alert('The file you uploaded is not in a supported format.\n\nWe support the following file formats:\n- .png\n- .jpg/.jpeg\n- .paa');
            } else {
                alert('None of the files you uploaded are in a supported format.\n\nWe support the following file formats:\n- .png\n- .jpg / .jpeg\n- .paa');
            }
        }

        this.files.push(...newFiles);

        // remove all files from input
        input.value = '';
    }

    private get isHomeShown (): boolean {
        return this.files.length === 0;
    }

    private get isFilesShown (): boolean {
        return this.files.length > 0;
    }
}
</script>

<style lang="scss" src="@/assets/global.scss"></style>

<style lang="scss" scoped>
footer {
    height: 3rem;
    width: 100%;
    box-sizing: border-box;
    background-color: var(--color-footer);
    color: var(--color-background);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1.5rem;

    > a {
        display: grid;
        grid-column-gap: .25rem;
        grid-auto-flow: column;
        align-items: center;
        color: var(--color-background);
        opacity: 0.5;

        &:hover {
            text-decoration: underline;
        }
    }
}
</style>
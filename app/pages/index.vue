<script setup lang="ts">
const file = ref<File | null>(null);

const formattedSize = computed(() => {
    if (!file.value) return "";
    const sizeInMB = file.value.size / (1024 * 1024);
    return `${sizeInMB.toFixed(2)} MB`;
});

const apiKey = ref("");
const link = ref("");

const uploadFile = () => {
    if (!file.value) return;

    const form = new FormData();
    form.append("file", file.value);

    console.log("Uploading file:", file.value);
    console.log("is File instance?", file.value instanceof File);

    // inspect form entries
    for (const [key, val] of form.entries()) {
        console.log("form entry", key, val);
    }

    $fetch("/api/upload", {
        method: "POST",
        body: form,
        headers: {
            "x-api-key": apiKey.value,
        },
    })
        .then(res => {
            console.log("Upload response:", res);
            const resData = res as any;
            if (resData.success) {
                link.value = resData.url;
                console.log("File uploaded successfully. Access it at:", link.value);
            } else {
                console.error("Upload failed:", resData.message);
            }
        })
        .catch(err => console.error(err));
};
</script>

<template>
    <div class="flex flex-col justify-center items-center h-screen">
        <UiCard class="w-90 max-w-sm" title="Uploader" description="upload your files here 100% safe trust me :3">
            <template #content>
                <UiCardContent class="flex flex-col gap-4">
                    <UiDropfile @dropped="file = $event[0]" :multiple="false" subtext="Only videos are accepted" />
                    <div v-if="file" class="mt-5">
                        <div
                            class="group relative mb-2 flex h-12 items-center justify-between rounded-md border px-3 py-3">
                            <div class="relative flex grow items-center gap-3">
                                <Icon name="lucide:file" class="mr-3 h-5 w-5 opacity-60" />
                                <p class="w-[80%] truncate text-sm">{{ file.name }}</p>
                                <p
                                    class="absolute right-3 ml-auto text-xs whitespace-nowrap text-muted-foreground/60 opacity-100 transition group-hover:opacity-0">
                                    {{ formattedSize }}
                                </p>
                            </div>

                            <div
                                class="absolute right-3 scale-50 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                                <UiButton size="icon-sm" variant="outline" @click="file = null">
                                    <Icon name="heroicons:x-mark" class="h-3.5 w-3.5" />
                                </UiButton>
                            </div>
                        </div>
                    </div>
                    <UiInput placeholder="Enter api key here..." v-model="apiKey" type="password" id="apikey" />
                    <p v-if="link" class="text-sm text-green-500">File uploaded successfully! Access it <a :href="link"
                            target="_blank" class="underline">here</a>.</p>
                    <UiButton effect="gradientGreen" @click="uploadFile">Upload</UiButton>
                    <UiButton effect="shineHover" variant="outline" @click="$router.push('/uploads')">Previous Uploads
                    </UiButton>
                </UiCardContent>
            </template>
        </UiCard>
    </div>
</template>
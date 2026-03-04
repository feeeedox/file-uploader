<template>
    <div class="flex flex-col justify-center items-center min-h-screen p-4 bg-background">
        <UiCard class="w-full max-w-2xl" title="My Uploads" description="Manage and share your uploaded files">
            <template #content>
                <UiCardContent class="flex flex-col gap-6">

                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium opacity-70">Authentication</label>
                        <div class="flex gap-2">
                            <UiInput id="apikey" v-model="apiKey" type="password" placeholder="Enter your API Key..."
                                class="grow" @keyup.enter="fetchUploads" />
                            <UiButton effect="shineHover" @click="fetchUploads" :disabled="loading" :loading="loading">
                                Load Files
                            </UiButton>
                        </div>
                    </div>

                    <UiSeparator />

                    <div v-if="error" class="text-center p-4 border border-destructive/20 rounded-lg bg-destructive/10">
                        <p class="text-sm text-destructive">{{ error }}</p>
                    </div>

                    <div v-else-if="uploads.length === 0 && searched"
                        class="flex flex-col items-center gap-2 py-10 opacity-50">
                        <Icon name="lucide:folder-open" class="h-10 w-10" />
                        <p>No uploads found for this API key.</p>
                    </div>

                    <div v-else-if="uploads.length > 0" class="flex flex-col gap-3">
                        <div v-for="upload in uploads" :key="upload.id"
                            class="group relative flex items-center justify-between rounded-lg border p-3 transition-hover hover:bg-muted/50">
                            <div class="flex items-center gap-3 overflow-hidden">
                                <div
                                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                    <Icon name="lucide:video" class="h-5 w-5" />
                                </div>
                                <div class="overflow-hidden text-sm">
                                    <p class="font-medium truncate">{{ upload.originalFileName }}</p>
                                    <p class="text-xs text-muted-foreground">
                                        {{ (upload.size / (1024 * 1024)).toFixed(2) }} MB • {{ new
                                            Date(upload.createdAt).toLocaleDateString() }}
                                    </p>
                                </div>
                            </div>

                            <div class="flex items-center gap-2">
                                <UiButton size="icon-sm" variant="ghost" title="Copy Link"
                                    @click="copyUrl(upload.fileName)">
                                    <Icon name="lucide:copy" class="h-4 w-4" />
                                </UiButton>

                                <UiButton size="icon-sm" variant="ghost"
                                    class="text-destructive hover:bg-destructive/10" title="Delete"
                                    @click="deleteUpload(upload.id)">
                                    <Icon name="lucide:trash-2" class="h-4 w-4" />
                                </UiButton>
                            </div>
                        </div>
                    </div>

                    <UiButton variant="outline" to="/">
                        Back to Uploader
                    </UiButton>
                </UiCardContent>
            </template>
        </UiCard>
    </div>
</template>

<script setup lang="ts">
// Logic bleibt größtenteils gleich, aber mit besseren UX-Variablen
const apiKey = ref('');
const uploads = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const searched = ref(false);

async function fetchUploads() {
    if (!apiKey.value) {
        error.value = 'Please enter an API key.';
        return;
    }
    loading.value = true;
    error.value = null;
    searched.value = true;

    try {
        const response = await fetch('/api/uploads', {
            headers: { 'x-api-key': apiKey.value },
        });
        const data = await response.json();
        if (data.success) {
            uploads.value = data.uploads;
        } else {
            error.value = data.message;
            uploads.value = [];
        }
    } catch (e) {
        error.value = 'Failed to connect to the server.';
    } finally {
        loading.value = false;
    }
}

async function deleteUpload(id: string) {
    // Schöneres Confirm wäre UiAlertDialog, aber confirm() reicht für den Anfang
    if (!confirm('Are you sure you want to delete this upload?')) return;

    try {
        const response = await fetch(`/api/uploads/${id}`, {
            method: 'DELETE',
            headers: { 'x-api-key': apiKey.value },
        });
        const data = await response.json();
        if (data.success) {
            uploads.value = uploads.value.filter(u => u.id !== id);
        }
    } catch (e) {
        alert('Failed to delete upload.');
    }
}

function copyUrl(fileName: string) {
    const url = `${window.location.origin}/api/u/${fileName}`;
    navigator.clipboard.writeText(url);
    // Hier könntest du einen Toast nutzen (z.B. UiToast)
}
</script>
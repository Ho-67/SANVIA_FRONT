<template>
  <v-window-item value="question">
    <v-card flat>
      <v-card-text>
        <!-- 問題列表 -->
        <v-list v-if="threadedQuestions.length > 0" bg-color="transparent">
          <template v-for="question in threadedQuestions" :key="question._id">
            <!-- 主留言 -->
            <v-list-item class="py-4">
              <v-list-item-title>
                <v-row class="align-center flex-nowrap" no-gutters>
                  <v-col class="d-flex align-center" style="min-width: 0">
                    <v-avatar class="mr-4" color="primary">
                      <span>{{ question.userId.account.charAt(0).toUpperCase() }}</span>
                    </v-avatar>
                    <div class="text-truncate">
                      <span class="font-weight-medium text-body-1">{{
                        question.userId?.account
                      }}</span>
                      <span v-if="question.isSeller">
                        <Icon
                          class="text-primary ml-1 mt-1"
                          height="18"
                          icon="streamline-plump:star-circle-solid"
                        />
                      </span>
                    </div>
                  </v-col>
                  <v-col cols="auto">
                    <div class="d-flex align-center justify-end ga-1 text-nav">
                      <div>
                        <v-btn icon @click="handleLikeDislike(question._id, 'like')">
                          <Icon
                            :color="question.userLiked ? 'red' : 'grey'"
                            height="32"
                            icon="game-icons:heart-wings"
                          />
                        </v-btn>
                        {{ question.likesCount }}
                      </div>
                      <div>
                        <v-btn icon @click="handleLikeDislike(question._id, 'dislike')">
                          <Icon
                            :color="question.userDisliked ? 'red' : 'grey'"
                            height="24"
                            icon="solar:heart-broken-bold"
                          />
                        </v-btn>
                        {{ question.dislikesCount }}
                      </div>
                      <div v-if="isCurrentUser(question.userId._id)">
                        <v-btn color="nav" icon="mdi-pencil" />
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </v-list-item-title>
              <div class="mt-2">
                <div
                  class="question-content"
                  :class="{ collapsed: !question.expanded && question.question.length > 150 }"
                >
                  {{ question.question }}
                </div>
                <v-btn
                  v-if="question.question.length > 150"
                  class="mt-1"
                  color="primary"
                  density="comfortable"
                  size="small"
                  @click="question.expanded = !question.expanded"
                >
                  {{ question.expanded ? '收合' : '展開' }}
                  <v-icon end :icon="question.expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                </v-btn>
              </div>
              <div class="d-flex align-center ga-1">
                <span class="text-primary">{{ question.floorNumber }}</span>
                <span class="text-caption text-nav">{{ formatDate(question.createdAt) }}</span>
                <v-btn class="rounded-pill" text="回覆" @click="handleReplyClick(question)" />
              </div>
            </v-list-item>

            <!-- 回覆串 -->
            <div v-if="question.repliesVisible && question.replies.length > 0" class="ml-8">
              <template v-for="reply in question.replies" :key="reply._id">
                <v-list-item class="py-3">
                  <v-list-item-title>
                    <v-row class="align-center flex-nowrap" no-gutters>
                      <v-col class="d-flex align-center" style="min-width: 0">
                        <v-avatar class="mr-4" color="secondary" size="32">
                          <span>{{ reply.userId.account.charAt(0).toUpperCase() }}</span>
                        </v-avatar>
                        <div class="text-truncate">
                          <span class="font-weight-medium text-body-1">{{
                            reply.userId?.account
                          }}</span>
                          <span v-if="reply.isSeller">
                            <Icon
                              class="text-primary ml-1 mt-1"
                              height="16"
                              icon="streamline-plump:star-circle-solid"
                            />
                          </span>
                        </div>
                      </v-col>
                      <v-col cols="auto">
                        <div class="d-flex align-center justify-end ga-1 text-nav">
                          <div>
                            <v-btn
                              density="compact"
                              icon
                              @click="handleLikeDislike(reply._id, 'like')"
                            >
                              <Icon
                                :color="reply.userLiked ? 'red' : 'grey'"
                                height="28"
                                icon="game-icons:heart-wings"
                              />
                            </v-btn>
                            {{ reply.likesCount }}
                          </div>
                          <div>
                            <v-btn
                              density="compact"
                              icon
                              @click="handleLikeDislike(reply._id, 'dislike')"
                            >
                              <Icon
                                :color="reply.userDisliked ? 'red' : 'grey'"
                                height="20"
                                icon="solar:heart-broken-bold"
                              />
                            </v-btn>
                            {{ reply.dislikesCount }}
                          </div>
                          <div v-if="isCurrentUser(reply.userId._id)">
                            <v-btn color="nav" density="compact" icon="mdi-pencil" />
                          </div>
                        </div>
                      </v-col>
                    </v-row>
                  </v-list-item-title>
                  <div class="mt-2">
                    <div class="question-content">
                      <span class="text-primary mr-2">@{{ reply.replyToDisplay || reply.replyTo }}</span>
                      {{ reply.question }}
                    </div>
                  </div>
                  <div class="d-flex align-center ga-1">
                    <span class="mr-4 text-primary">
                      {{ reply.floorNumber }}
                    </span>
                    <span class="text-caption text-nav">{{ formatDate(reply.createdAt) }}</span>
                  </div>
                </v-list-item>
              </template>
            </div>
            <v-divider />
          </template>
        </v-list>
        <!-- 無問題時的顯示 -->
        <div v-else class="text-center text-grey py-8">
          <p>目前還沒有任何問題，歡迎提出您的疑問！</p>
        </div>
        <!-- 發問輸入框 -->
        <div class="mt-4">
          <v-row align="center" no-gutters>
            <v-col class="mr-2" cols="auto">
              <v-avatar color="primary">
                <span>{{ isLoggedIn ? userAccount.charAt(0).toUpperCase() : '?' }}</span>
              </v-avatar>
            </v-col>
            <v-col>
              <v-textarea
                v-model="questionContent"
                append-inner-icon="mdi-send"
                auto-grow
                clearable
                density="comfortable"
                :disabled="!isLoggedIn || isSubmittingQuestion"
                hide-details
                :loading="isSubmittingQuestion"
                :placeholder="replyTo ? `回覆 ${replyTo.floorNumber}...` : '輸入您的問題...'"
                rows="1"
                variant="outlined"
                @click:append-inner="submitQuestion"
                @keydown.enter.prevent="handleEnterPress"
              />
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>
  </v-window-item>
</template>

<script setup>
  import { Icon } from '@iconify/vue'
  import { computed, onMounted, ref, watch } from 'vue'
  import { useSnackbar } from 'vuetify-use-dialog'
  import { apiQuestion } from '@/services/question'
  import { useUserStore } from '@/stores/user'

  const props = defineProps({
    productId: {
      type: String,
      required: true,
    },
  })

  // Stores & Utils
  const userStore = useUserStore()
  const createSnackbar = useSnackbar()

  // Computed
  const isLoggedIn = computed(() => userStore.isLoggedIn)
  const userAccount = computed(() => userStore.account)

  const threadedQuestions = computed(() => {
    const questionMap = {}
    const topLevelQuestions = []

    // First pass: map all questions by their ID
    for (const q of questions.value) {
      questionMap[q.floorNumber] = { ...q, replies: [] }
    }

    // Second pass: build the thread using the functional parent
    for (const q of Object.values(questionMap)) {
      if (q.replyTo && questionMap[q.replyTo]) {
        questionMap[q.replyTo].replies.push(q)
      } else {
        topLevelQuestions.push(q)
      }
    }

    // Sort replies by creation date
    for (const q of topLevelQuestions) {
      if (q.replies) {
        q.replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      }
    }

    return topLevelQuestions
  })

  // State
  const questions = ref([])
  const isSubmittingQuestion = ref(false)
  const questionContent = ref('')
  const replyTo = ref(null)

  // Watch for changes in questionContent to auto-detect replies
  watch(questionContent, (newValue) => {
    const replyPattern = /^@(B\d+(?:-\d+)?)\s/
    const match = newValue.match(replyPattern)

    if (match) {
      const targetFloor = match[1]
      // Find the question being replied to from the flat list
      const targetQuestion = questions.value.find((q) => q.floorNumber === targetFloor)

      if (targetQuestion) {
        replyTo.value = targetQuestion
      } else {
        // If the target doesn't exist, don't treat it as a reply
        replyTo.value = null
      }
    } else {
      replyTo.value = null
    }
  })

  // Methods
  const formatDate = (date) => {
    return new Date(date).toLocaleString('zh-TW', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isCurrentUser = (userId) => userStore.id === userId

  const handleEnterPress = (e) => {
    if (e.shiftKey) return // Shift + Enter allows new line
    submitQuestion()
  }

  const handleReplyClick = (question) => {
    if (!isLoggedIn.value) {
      createSnackbar({
        text: '請先登入才能回覆',
        snackbarProps: { color: 'warning' },
      })
      return
    }

    // Toggle replies visibility for the parent question
    const parentFloor = question.replyTo || question.floorNumber
    const parentQuestion = questions.value.find((q) => q.floorNumber === parentFloor)
    if (parentQuestion) {
      parentQuestion.repliesVisible = !parentQuestion.repliesVisible
    }

    // Set reply context
    replyTo.value = question
    questionContent.value = `@${question.floorNumber} `
  }

  const handleLikeDislike = async (questionId, type) => {
    if (!isLoggedIn.value) {
      createSnackbar({
        text: '請先登入才能進行操作',
        snackbarProps: { color: 'warning' },
      })
      return
    }

    try {
      const { data } = await apiQuestion[type](questionId)
      if (data.success) {
        const itemToUpdate = questions.value.find((q) => q._id === questionId)
        if (itemToUpdate) {
          const { likesCount, dislikesCount, userLiked, userDisliked } = data.result
          itemToUpdate.likesCount = likesCount
          itemToUpdate.dislikesCount = dislikesCount
          itemToUpdate.userLiked = userLiked
          itemToUpdate.userDisliked = userDisliked
        }
      } else {
        createSnackbar({
          text: data.message || '操作失敗',
          snackbarProps: { color: 'error' },
        })
      }
    } catch (error) {
      console.error(`操作失敗 (${type}):`, error)
      createSnackbar({
        text: error?.response?.data?.message || `操作失敗 (${type})`,
        snackbarProps: { color: 'error' },
      })
    }
  }

  const submitQuestion = async () => {
    if (!isLoggedIn.value) {
      createSnackbar({ text: '請先登入才能留言', snackbarProps: { color: 'warning' } })
      return
    }
    if (!questionContent.value.trim()) {
      createSnackbar({ text: '請輸入內容', snackbarProps: { color: 'warning' } })
      return
    }

    try {
      isSubmittingQuestion.value = true

      const replyPattern = /^@(B\d+(?:-\d+)?)\s/
      const match = questionContent.value.match(replyPattern)

      let finalContent = questionContent.value.trim()
      let replyToForBackend = null

      if (match) {
        // If there's a mention at the start, use it as the replyTo target for the backend.
        replyToForBackend = match[1] // This will be 'B1' or 'B1-1'
        finalContent = finalContent.replace(replyPattern, '').trim()
      } else if (replyTo.value) {
        // This handles the case where user clicks the "Reply" button.
        replyToForBackend = replyTo.value.floorNumber
      }

      const { data } = await apiQuestion.create({
        product: props.productId,
        content: finalContent,
        replyTo: replyToForBackend,
      })

      if (data.success) {
        createSnackbar({
          text: replyToForBackend ? '回覆成功' : '留言成功',
          snackbarProps: { color: 'success' },
        })
        questionContent.value = ''
        replyTo.value = null
        await fetchQuestions()
      }
    } catch (error) {
      console.error(replyTo.value ? '回覆失敗:' : '留言失敗:', error)
      createSnackbar({
        text: error?.response?.data?.message || (replyTo.value ? '回覆失敗' : '留言失敗'),
        snackbarProps: { color: 'error' },
      })
    } finally {
      isSubmittingQuestion.value = false
    }
  }

  const fetchQuestions = async () => {
    // Preserve the expanded/visible state by floorNumber
    const preservedStates = new Map()
    for (const q of questions.value) {
      if (q.repliesVisible || q.expanded) {
        preservedStates.set(q.floorNumber, {
          expanded: q.expanded,
          repliesVisible: q.repliesVisible,
        })
      }
    }

    try {
      const { data } = await apiQuestion.getByProduct(props.productId)
      if (data.success) {
        questions.value = data.result.map((q) => {
          const state = preservedStates.get(q.floorNumber) || {
            expanded: false,
            repliesVisible: false,
          }
          return {
            ...q,
            expanded: state.expanded,
            repliesVisible: state.repliesVisible,
            likesCount: q.likes?.length || 0,
            dislikesCount: q.dislikes?.length || 0,
            userLiked: q.likes?.includes(userStore.id) || false,
            userDisliked: q.dislikes?.includes(userStore.id) || false,
          }
        })
      }
    } catch (error) {
      console.error('取得問題失敗:', error)
      createSnackbar({
        text: error?.response?.data?.message || '取得問題失敗',
        snackbarProps: { color: 'error' },
      })
    }
  }

  // Expose methods for parent component
  defineExpose({ fetchQuestions })

  onMounted(() => {
    fetchQuestions()
  })
</script>

<style scoped>
  .question-content {
    overflow: hidden;
    transition: max-height 0.3s ease, opacity 0.3s ease;
    position: relative;
  }

  .question-content.collapsed {
    max-height: 4.5em; /* Approx 3 lines */
  }

  .question-content.collapsed::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2em;
    background: linear-gradient(
      to top,
      rgba(var(--v-theme-surface), 1),
      rgba(var(--v-theme-surface), 0)
    );
    pointer-events: none;
  }

  .question-content.expanded {
    max-height: none;
  }
</style>

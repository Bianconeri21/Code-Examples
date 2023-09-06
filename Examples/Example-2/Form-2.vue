<template>
  <Show :description="task.content.description" :is-exam="isExam" :task="task" @clickedPauseButton="clickedPauseButton" @submitted="nextSubmit">
    <div class="task px-6">
      <div class="grid gap-10 lg:gap-2 lg:grid-cols-2 grid-cols-1 sm:px-5 md:px-24 lg:px-0">
        <div class="scroll-behaviour">
          <div class="bg-white shadow-xl rounded-[20px] w-full h-fit p-2">
            <div v-html="task.content.text"
                 class="font-normal m-10 sm:my-11 sm:mx-11">
            </div>
          </div>
        </div>


        <div class="lg:col-start-2 scroll-behaviour">
          <div class="grid gap-10">
            <div v-for="(di_question, index) in task.di_questions"
                 :class="'order-' + di_question.order"
                 class="p-8 xl:px-[109px] lg:px-[53px] lg:py-12 bg-white shadow-xl rounded-[20px] justify-content-center">
              <p v-if="isEmptyContent(di_question.content.text)" class="description mb-4 sm:mb-12"
                 v-html="di_question.content.text"></p>

              <div class="task-answer cursor-pointer flex justify-content-center">
                <label :for="'true-value-' + index" class="cursor-pointer w-1/2">
                  <input type="radio"
                         :id="'true-value-' + index"
                         :disabled="isSubmitting"
                         :value="true" :name="'answer-di-' + index"
                         v-model="form.candidate_answers.di[index].answer"
                         class="hidden"/>
                  <div v-text="'Richtig'"
                       class="text-center py-4 bg-[#E6E6E6] rounded-l-[20px] border-l border-gray-300 hover:bg-gray-300 border-options"></div>
                </label>
                <label :for="'false-value-' + index" class="cursor-pointer w-1/2">
                  <input type="radio"
                         :id="'false-value-' + index"
                         :disabled="isSubmitting"
                         :value="false" :name="'answer-di-' + index"
                         v-model="form.candidate_answers.di[index].answer"
                         class="hidden"/>
                  <div v-text="'Falsch'"
                       class="text-center py-4 bg-[#E6E6E6] rounded-r-[20px] border-r border-gray-300  hover:bg-gray-300 border-options"></div>
                </label>
              </div>
              <div class="task-answer mt-8 cursor-pointer">
                <label :for="'dont-know' + index" class="cursor-pointer">
                  <input type="radio"
                         :id="'dont-know' + index"
                         :disabled="isSubmitting"
                         :value="0" :name="'answer-di-' + index"
                         v-model="form.candidate_answers.di[index].answer"
                         class="hidden"/>
                  <div v-text="'Ich weiß es nicht.'"
                       class="text-center sm:text-left sm:px-8 py-4 bg-[#E6E6E6] rounded-[20px] hover:bg-gray-300"></div>
                </label>
              </div>
            </div>

            <div v-for="(sc_question, index) in task.sc_questions"
                 :class="'order-' + sc_question.order"
                 class="sm:sc-question bg-white shadow-xl rounded-[20px] w-full justify-content-center p-8 sm:p-12">
              <p v-if="isEmptyContent(sc_question.content.text)" class="description mb-8 sm:mb-12"
                 v-html="sc_question.content.text"></p>
              <div v-for="(answer, key) in sc_question.answers"
                   class="task-answer mt-6 first-of-type:mt-0 cursor-pointer">
                <label :for="'sc_question-' + answer.id + key" class="cursor-pointer">
                  <input type="radio"
                         :id="'sc_question-' + answer.id + key"
                         :disabled="isSubmitting"
                         :value="answer.id"
                         :name="'sc_questiona-' + index"
                         v-model="form.candidate_answers.sc[index].answer_id"
                         class="hidden"/>
                  <div v-html="answer.content.text"
                       class="px-8 py-4 bg-[#E6E6E6] rounded-[20px] hover:bg-gray-300 border-options"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Show>
</template>

<script>
import {defineComponent} from 'vue';
import Show from '../../Show';
import AudioPlayer from '../../../../Components/AudioPlayer';

export default defineComponent({
  name: 'rea_mixed_1',

  components: {
    AudioPlayer,
    Show,
  },

  props: {
    isExam: {
      type: Boolean,
      default: false,
    },
    testAttemptPaused: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      task: this.$page.props.task,
      isSubmitting: false,
      form: this.$inertia.form({
        _method: 'POST',
        candidate_answers: {
          sc: [],
          di: [],
        },
        task_attempt_id: this.$page.props.task_attempt_id,
        test_attempt_paused: this.testAttemptPaused,
      }),
    }
  },

  beforeMount() {
    if (this.task?.sc_questions) {
      this.task.sc_questions.map((sc_question) => {
        sc_question.answers.push({content: {text: 'Ich weiß es nicht.'}, id: 0});
        this.form.candidate_answers.sc.push({question_id: sc_question.id})
      });
    }
    if (this.task?.di_questions) {
      this.task.di_questions.map((di_question) => {
        this.form.candidate_answers.di.push({question_id: di_question.id, answer: null})
      });
    }
  },

  methods: {
    clickedPauseButton(){
      this.form.test_attempt_paused = true;
    },

    isEmptyContent(content) {
      if (!content.replace(/(<\/?[^>]+(>|$)|&nbsp;|\s)/g, "")) {
        return null;
      }
      return true;
    },

    nextSubmit() {
      this.isSubmitting = true;
      if (this.task.content.audio_url) {
        this.$refs.audio.audio.pause();
        this.$refs.audio.isTimerPlaying = false;
      }
      this.form.post(route('web.task_attempts.submit'));
    },
  },
});
</script>

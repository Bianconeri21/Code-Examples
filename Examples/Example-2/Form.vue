<template>
  <Show :description="task.content.description" :is-exam="isExam" :task="task" @clickedPauseButton="clickedPauseButton"
        @submitted="nextSubmit">
    <div class="task px-6">
      <div class="grid gap-10 lg:gap-2 lg:grid-cols-2 grid-cols-1 sm:px-5 md:px-24 lg:px-0">
        <div class="scroll-behaviour">
          <div class="bg-white shadow-xl sm:rounded-[20px] w-full p-8 sm:p-12 h-fit inline-flex text-[22px] font-normal leading-[78.43px]">
            <div v-if="task.formatted_content" class="lex-sc-2">
              <div v-for="(aboutText) in task.formatted_content.text" class="inline">
                <div v-if="aboutText.type === 'text'" v-html="aboutText.text" class="inline mr-5"></div>
                <div v-else class="inline-flex mr-5 leading-[2]">
                  <div v-if="form.candidate_answers.sc[0].answer_id"
                       class="selected-option inline-flex bg-[#BDD8D6] border border-[#1B998B]">
                    <span class="px-4 children:inline children:mr-1" v-html="chosenOption">
                    </span>
                  </div>
                  <div v-else
                       class="selected-option inline border border-[#1B998B] pt-[4px]">
                    <dots></dots>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="scroll-behaviour">
          <div
              class="sm:sc-question bg-white shadow-xl rounded-[20px] w-full flex-col justify-content-center p-8 sm:p-12">
            <p v-if="isEmptyContent(task.sc_questions[0].content.text)" class="description mb-8 sm:mb-12"
               v-html="task.sc_questions[0].content.text"></p>
            <div v-for="answer in task.sc_questions[0].answers"
                 class="task-answer mt-6 first-of-type:mt-0 cursor-pointer">
              <label :for="answer.id" class="cursor-pointer">
                <input type="radio"
                       :id="answer.id"
                       :value="answer.id"
                       name="answer"
                       :disabled="isSubmitting"
                       v-model="form.candidate_answers.sc[0].answer_id"
                       class="hidden"/>
                <div v-html="answer.content.text"
                     class="px-8 py-4 bg-[#E6E6E6] rounded-[20px] hover:bg-gray-300 border-options"></div>
              </label>
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
import Dots from '../../../../Components/Icons/Dots';
import Label from '../../../../Jetstream/Label';
import Input from '../../../../Jetstream/Input';


export default defineComponent({
  name: 'lex_sc_2',
  emits: ['submitted', 'nextSubmit'],

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

  components: {
    Input,
    Label,
    Show,
    Dots
  },

  computed: {
    chosenOption() {
      let vm = this;
      let chosenOption = this.task.sc_questions[0].answers.filter((answer) => {
        if (answer.id === vm.form.candidate_answers.sc[0].answer_id)
          return answer
      });
      return chosenOption[0].content.text;
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
        },
        task_attempt_id: this.$page.props.task_attempt_id,
        test_attempt_paused: this.testAttemptPaused,
      }),
    }
  },

  beforeMount() {
    this.task?.sc_questions.map((sc_question) => {
      sc_question.answers.push({content: {text: 'Ich weiß es nicht.'}, id: 0});
      this.form.candidate_answers.sc.push({question_id: sc_question.id})
    });
  },

  methods: {
    clickedPauseButton() {
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
      this.form.post(route('web.task_attempts.submit'));
    },
  },
});
</script>

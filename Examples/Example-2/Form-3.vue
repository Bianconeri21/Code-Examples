<!---------------------------------------------Create "reading sc1" layout--------------------------------------------->
<template>
  <Show :description="task.content.description" :is-exam="isExam" :task="task" @clickedPauseButton="clickedPauseButton"
        @submitted="nextSubmit">
    <div class="task px-6">
      <div class="scroll-behaviour">
        <div
            class="lg:overflow-y-auto bg-white shadow-xl sm:rounded-[20px] py-4 px-10 text-[22px] font-normal leading-[60px]">
          <div v-for="(item, index) in task.formatted_content.text" class="remove-this rounded-t-xl inline">
            <span v-if="item.type === 'text'" v-html="item.text" class="remove-this"/>
            <div v-else class="custom-single-multiselect w-48 leading-[2] inline-table cursor-pointer">
              <VueMultiselect
                  :disabled="isSubmitting"
                  v-if="item.type === 'dropdown'"
                  class="hover:bg-gray-100"
                  v-model="selectedAnswers[index]"
                  track-by='id'
                  :options="item.answers"
                  placeholder="Antwort wählen"
                  label="text"
                  :max-height="600"
                  :show-labels="false"
                  :allow-empty="true"
                  :searchable="false">
              </VueMultiselect>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Show>
</template>

<script>
import {defineComponent} from 'vue';
import VueMultiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';
import Show from '../../Show';

export default defineComponent({

  name: 'wri_sc_1',
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
    VueMultiselect,
    Show,
  },

  data() {
    return {
      task: this.$page.props.task,
      isSubmitting: false,
      selectedAnswers: [],
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
    this.task?.formatted_content.text.map((sc_question, index) => {
      if (sc_question.type === 'dropdown' && sc_question.answers) {
        sc_question.answers?.push({text: 'Ich weiß es nicht.', id: 0});
        this.form.candidate_answers.sc[index] = {question_id: sc_question.id}
      }
    });
  },

  mounted() {
    const fragment = document.createDocumentFragment(),
        allRemovedElements = document.querySelectorAll(".remove-this"),
        allMultiselect = document.querySelectorAll(".custom-single-multiselect");

    allRemovedElements.forEach((element) => {
      while (element.firstChild) {
        fragment.appendChild(element.firstChild);
      }
      element.parentNode.replaceChild(fragment, element);
    });

    allMultiselect.forEach((element) => {
      element.previousElementSibling.classList.add('inline');
    });

    if (allMultiselect.length) {
      allMultiselect[allMultiselect.length - 1].nextElementSibling.classList.add('inline');
    }
  },


  methods: {
    clickedPauseButton() {
      this.form.test_attempt_paused = true;
    },

    nextSubmit() {
      this.isSubmitting = true;
      this.form.candidate_answers.sc.forEach((element, index) => {
        element.answer_id = this.selectedAnswers[index]?.id
      });
      this.form.candidate_answers.sc = Object.values(this.form.candidate_answers.sc);
      this.form.post(route('web.task_attempts.submit'));
    },
  },
});
</script>

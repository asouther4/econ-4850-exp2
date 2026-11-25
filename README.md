# ECON 4850 — Class Experiment 2

A browser version of the "red dots" task from Dean & Neligh (2023), "Experimental Tests of
Rational Inattention," *Journal of Political Economy* 131(12). It is built with jsPsych 5.0
and hosted as a static site, the same way as Experiment 1.

Each question shows 100 dots, some red and some blue. The **true state** is the number of
red dots. Students are told how likely each true state is (the **prior**), then choose an
**action** whose payoff, in dollars, depends on the state. Each true state belongs to one
**payoff-relevant state**, and an action pays the same in every true state of a
payoff-relevant state. In experiments 1.1–1.3 of the paper every number of red dots is its
own payoff-relevant state. In experiment 1.4 there are several true states (e.g. 47 to 54 red
dots) but only two payoff-relevant states: 50 or fewer red dots, and 51 or more. Questions come
in sections, one for each **treatment** (a decision problem, or DP, in the paper). Every
question in a section uses the same states, prior and actions, and the true state is drawn
from the prior independently for each question. Dot positions are randomized for every
question. There is no time limit and no feedback after a question.

**Payment.** Only one student is paid. After the deadline one student is drawn at random, then
one of that student's questions, and the student is paid, in dollars, what their chosen option
paid in that question. The experiment says this prominently on the landing page and on its
own instruction page. See [Payment](#payment) for how to do the draw.

The design is not written into the code. It is read from a JSON file in `Task1/configs/`, so
you change the experiment by editing or swapping that file. Three are included:

| File | Design |
|------|--------|
| `configs/dean-neligh-exp1.1-to-1.4-class.json` | **The default.** Experiments 1.1, 1.2, 1.3 and 1.4, shortened, run as Parts A–D of one session, in a random order for each student: 2 + 3 + 3 + 1 = 9 DPs, with 2 questions per DP (for testing). See [the default design](#the-default-design-experiments-11-to-14). |
| `configs/dean-neligh-exp1.2-and-1.4.json` | Experiments 1.2 (all four DPs) and 1.4 (all four DPs) as Parts A and B (in that order), with 2 questions per DP. |
| `configs/dean-neligh-exp1.2.json` | Experiment 1.2 only (all four DPs), with 10 questions per DP. |

All three use dollar payoffs. The two older files were written for probability points with a
prize; they have been converted, so their payoffs (up to $95) are now read as dollars.

## The config file

A config file holds a list of **experiments**. Each experiment is run as one part of the
session. Parts are labelled with letters, Part A, Part B, …, in the order each student meets
them. This is part of `configs/dean-neligh-exp1.1-to-1.4-class.json`:

```json
{
  "randomize_part_order": true,
  "practice": {...},
  "experiments": [
    {
      "id": "exp1.1",
      "reps_per_treatment": 2,
      "instructions": ["In this part of the experiment there will always be either **49 or 51 red dots** ..."],
      "treatments": [
        {
          "id": "DP1",
          "states": [49, 51],
          "prior": [0.5, 0.5],
          "actions": [
            {"label": "A", "payoffs": {"49": 50, "51": 50}},
            {"label": "B", "payoffs": {"49": 30, "51": 52}}
          ]
        },
        ...
      ]
    },
    ...
    {
      "id": "exp1.4",
      "reps_per_treatment": 2,
      "instructions": [...],
      "treatments": [
        {
          "id": "N8",
          "states": [47, 48, 49, 50, 51, 52, 53, 54],
          "prior": "uniform",
          "prior_description": "There will be between 47 and 54 red dots on the screen, and each of these 8 numbers is equally likely (a 1 in 8 chance each).",
          "payoff_states": [
            {"id": "low",  "label": "50 or fewer red dots", "states": [47, 48, 49, 50]},
            {"id": "high", "label": "51 or more red dots",  "states": [51, 52, 53, 54]}
          ],
          "actions": [
            {"label": "A", "payoffs": {"low": 10, "high": 0}},
            {"label": "B", "payoffs": {"low": 0, "high": 10}}
          ]
        }
      ]
    }
  ]
}
```

| Setting | Meaning |
|---------|---------|
| `experiments` | The list of experiments. Each one is a part of the session. |
| `randomize_part_order` | `true` shuffles the order of the parts separately for each student; each part's sections are then shuffled within it if its `randomize_order` is `true` (block randomization at both levels). `false` runs the parts in file order. Optional; defaults to `false`. The parts are labelled A, B, … in the order the student meets them, so with shuffling "Part A" is a different experiment for different students; the data file's `experiment` column says which. |
| `practice` | Optional. One unpaid example question for the whole session, set up like a treatment (see below). It comes after the general instructions and before Part A, whatever the order of the parts, and is followed by a screen showing what it would have paid. Use this rather than an experiment's own `practice` when the parts are shuffled, so the example question always comes first. |

A file with only one experiment can leave out `experiments` and put that experiment's
settings at the top level. `configs/dean-neligh-exp1.2.json` does this.

Earlier versions of this code had a top-level `prize` setting, for probability points. It is
no longer used, and a file that still has it is rejected with a message saying so.

### Experiments

| Setting | Meaning |
|---------|---------|
| `id` | A name for the experiment, recorded in the data file's `experiment` column. Students never see it. Optional; defaults to `E1`, `E2`, … in file order. |
| `reps_per_treatment` | How many questions each treatment gets. |
| `randomize_order` | `true` shuffles the order of this experiment's sections separately for each student (block randomization). `false` uses the order in the file. Optional; defaults to `true`. The order of the parts is set by the top-level `randomize_part_order`. |
| `instructions` | Optional. Text explaining this experiment to students, as a list of paragraphs (or a single piece of text). It is shown on the page that introduces the part, before its practice question. Use it to explain the design in plain words, e.g. that only whether there are 50 or fewer red dots matters. |
| `overview_note` | Optional. Text, as a list of paragraphs (or a single piece of text), shown at the bottom of the page that lists this part's sections, just after the last section. Use it to say in plain words how the sections differ. `**like this**` is shown in bold. Because the sections are shuffled for each student, write `{section:DP3}` for "the number of the section that treatment `DP3` is in"; each student sees the number from their own order. Every `{section:...}` must name one of the experiment's treatment `id`s, or the file is rejected. For example, in experiment 1.2: `"In Section {section:DP3} the payoffs are lowest ($5), ..."`. The default config gives each experiment one, all in the same pattern: what the sections have in common, then what differs. |
| `practice` | Optional. One unpaid example question for this part, set up like a treatment. It is asked at the start of the part, after its `instructions`, and is followed by a screen showing what it would have paid. Leave it out to skip it. For an example question at the start of the whole session, use the top-level `practice`. |
| `n_treatments` | Optional. If given, it must equal the number listed under `treatments`, as a check. |
| `treatments` | The list of treatments, one section each. |

### Treatments

Each treatment, and each practice question, has these settings:

| Setting | Meaning |
|---------|---------|
| `id` | Treatments only. A name for the treatment, recorded in the data file's `treatment` column. Students never see it. Optional; defaults to `T1`, `T2`, … in file order. |
| `states` | The true states: the possible numbers of red dots (0–100), e.g. `[49, 51]`. Any number of states is allowed. |
| `prior` | The probability of each true state, in the same order as `states`. The probabilities must add up to 1. Or `"uniform"` if every state is equally likely. |
| `payoff_states` | Optional. The payoff-relevant states, as a list. Each has an `id` (e.g. `"low"`), the `states` that belong to it (numbers of red dots, e.g. `[47, 48, 49, 50]`), and an optional `label` that completes "Pay if there are …", e.g. `"50 or fewer red dots"`. Every true state must belong to exactly one payoff-relevant state. Without a `label`, one is made from the numbers, e.g. "between 47 and 50 red dots". Leave `payoff_states` out to make every true state its own payoff-relevant state, as in experiments 1.1–1.3. |
| `actions` | At least two actions. Each has a `label`, which students see (e.g. `"A"`), and `payoffs`, which gives the payoff in every payoff-relevant state, keyed by its `id`. Without `payoff_states`, the keys are the numbers of red dots, in quotation marks. **Payoffs are dollars**, written as plain numbers (`40` for $40; cents are allowed, e.g. `12.5` for $12.50), 0 or more. Students see them as "$40". The table's rows follow the order of the actions. |
| `prior_description` | Optional. Text, or a list of paragraphs, that replaces the list of probabilities ("With 50% probability there will be 49 red dots", one line per state) wherever students are told the prior: in the overview, at the start of the section, and on every question. Use it when there are many states, e.g. "There will be between 41 and 60 red dots on the screen, and each of these 20 numbers is equally likely." |

The table of options has one column per payoff-relevant state, in the order of
`payoff_states` (or of `states`). So in experiment 1.4 students see two columns, "Pay if there
are 50 or fewer red dots" and "Pay if there are 51 or more red dots", however many true states
there are. The text in `instructions`, `prior_description` and `label` is shown as written.
It cannot contain HTML, but `**like this**` is shown in bold. It is not checked against the
numbers, so if you change the states or payoffs, update the wording too.

The instruction pages adapt to the file. They give the number of parts, sections and
questions. The general instructions take their example table of options, and the sentences
explaining it, from the top-level `practice` question; if there is none, from the practice
question of the first experiment in the file, or else from its first treatment. When there is
more than one experiment, each part starts with a page headed "Part A" (etc.), followed by the
experiment's `instructions`, its own practice question if it has one, and a page headed "Part A
Instructions" (etc.) giving an overview of its sections.

**Checks.** Before anything is shown, the whole file is checked. If anything is wrong, the
page lists every problem instead of starting: invalid JSON, a misspelled setting, a prior
that does not add up to 1, a true state in no payoff-relevant state or in two, a missing or
negative payoff, `n_treatments` not matching the list, a leftover `prize`, and so on. Settings
whose names start with an underscore (e.g. `"_about": "..."`) are treated as notes and
ignored, since JSON has no comments.

**Which file is used.** `Task1/index.html` loads `CONFIG_FILE`, set near the top of its
script (`configs/dean-neligh-exp1.1-to-1.4-class.json`). One link can use a different file by
adding `?config=` to the address, e.g. `.../econ-4850-exp2/Task1/?config=configs/my-design.json`.
That is handy for testing a new design, or for giving different groups of students different
designs. A link can also run only some of a file's experiments by adding `experiment=` with
their ids, separated by commas, e.g. `.../Task1/?experiment=exp1.3,exp1.4`. The data file
records which config file and experiment were used.

## Testing on your own computer

Because the design is read from a separate file, the experiment needs to be served by a web
server. Opening `Task1/index.html` by double-clicking it does not work: browsers block a page
opened from `file://` from reading the config file. The page says so if you try. Instead:

1. In a terminal, go to the `econ-4850-exp2` folder.
2. Run `python -m http.server 8000`.
3. Open `http://localhost:8000/` in your browser. Use `Ctrl+C` in the terminal to stop the
   server.

Only your computer can see it. Edits to the config file take effect when you reload the
page.

## The default design: experiments 1.1 to 1.4

`configs/dean-neligh-exp1.1-to-1.4-class.json` runs a shortened version of all four of the
paper's "experiment 1" designs as four parts of one session. The paper's probability points
are read as dollars. Treatment ids follow the paper's DP numbers.

**Order.** The order of the four parts is random for each student, and so is the order of the
sections within each part (block randomization at both levels; the paper block randomized the
DPs within an experiment). Students see the parts labelled Part A to Part D in the order they
meet them, so "Part A" is experiment 1.3 for one student and experiment 1.1 for another; use
the data file's `experiment` column, not `part`, to tell the experiments apart.

**Overview notes.** Each part's "Part X Instructions" page, which lists its sections, ends with
a bold note (`overview_note`) that restates the part's design in one pattern: "As you can see,
all 3 sections have the same …" followed by what differs, with section numbers in the student's
own order (e.g. "$5 in Section 2, $40 in Section 3 and $90 in Section 1").

**Practice question.** After the general instructions and before Part A, every student
answers one unpaid example question, the A $10/$0, B $0/$10, C $5/$5 example of appendix A0
(49 or 51 red dots, equally likely). It is the config's top-level `practice`. None of the
parts has a practice question of its own.

**Experiment 1.1 (responsive attention / monotonicity), section III.B.** Both DPs.
Two equally likely states, 49 and 51 red dots.

| Treatment `id` | A (49 / 51) | B (49 / 51) | C (49 / 51) |
|----------------|-------------|-------------|-------------|
| DP1            | $50 / $50   | $30 / $52   | —           |
| DP2            | $50 / $50   | $30 / $52   | $100 / $0   |

The paper ran four between-subject values of b's payoffs, (40, 55), (40, 52), (30, 55) and
(30, 52). This uses (30, 52), its treatment 4, which had the strongest aggregate violation of
monotonicity in table 2.

**Experiment 1.2 (changing incentives), section III.C.** Three of the four DPs. Two
equally likely states, 49 and 51 red dots; A pays R with 49 red dots, B pays R with 51.

| Treatment `id` | R   |
|----------------|-----|
| DP3            | $5  |
| DP4            | $40 |
| DP6            | $90 |

The paper's DP5 (75) is dropped. Section III.C lists the rewards as 5, 40, 75 and 90, while
equation (2), section IV.B and appendix A0 use 5, 40, 70 and 95. This design uses section
III.C's 90. (The older configs use 70 and 95.)

**Experiment 1.3 (changing priors), section III.D.** Three of the four DPs. Two
states, 47 and 53 red dots; A pays $10 with 47 red dots, B pays $10 with 53, as in the paper
(which paid this experiment in cash).

| Treatment `id` | P(47 red dots) |
|----------------|----------------|
| DP7            | 0.5            |
| DP8            | 0.6            |
| DP10           | 0.85           |

The paper's DP9 (0.75) is dropped.

**Experiment 1.4 (invariance under compression), section III.E.** The 8-state
treatment only, `N8`: 47 to 54 red dots, equally likely. A pays $10 with 50 or fewer red dots
(`low`), B pays $10 with 51 or more (`high`), as in the paper, which paid $10 in cash. Students
see two columns, "Pay if there are 50 or fewer red dots" and "Pay if there are 51 or more red
dots", and `prior_description` tells them the range instead of listing 8 probabilities. The
part's `instructions` explain that only this matters, and that 51 or more red dots means more
red dots than blue dots. The wording follows appendix A0 and the "letters" treatment in
appendix 5.4. As in the paper, there is no practice question for this experiment.

Other differences from the paper:

- **2 questions per DP instead of 50 or 75**, for testing: 18 questions in all plus 1
  practice question. Raise `reps_per_treatment` in each experiment for the real run.
- **One student is paid** (see [Payment](#payment)), not every subject.
- **Dollars, not probability points.** The paper paid experiments 1.1 and 1.2 in probability
  points so that utility is linear in them. Paying dollars directly assumes risk neutrality
  over these amounts, which matters for the quantities below that use payoff levels (e.g. κ
  in experiment 1.2).
- **One session for all four experiments.** In the paper each experiment had its own subjects.
  Here every student does all four, in a random order, so each experiment is done early in
  the session by some students and late by others. Order effects can be checked with the
  `part` column.
- **50 red dots counts as `low`** in experiment 1.4. The paper's states run from 1 to N with A
  paying in {1, …, N/2}, so with 47–54 red dots A pays at 47–50.
- **Online, not in a lab.** The lab-specific lines are dropped (show-up fee, phones, staying
  seated until everyone finishes). Students are asked to use a laptop or desktop and to finish
  in one sitting. The paper notes that making lab subjects stay until everyone finished kept
  their opportunity cost of time low and similar across subjects. Online, students who want
  to leave may rush.

## The older configs

`dean-neligh-exp1.2-and-1.4.json` runs all four DPs of experiment 1.2 (R = $5, $40, $70, $95,
the values of equation 2 and appendix A0) as Part A and all four of experiment 1.4 as Part B,
always in that order (it does not set `randomize_part_order`):

| Treatment `id` | N  | Red dots | `low`   | `high`  |
|----------------|----|----------|---------|---------|
| N8             | 8  | 47–54    | 47–50   | 51–54   |
| N12            | 12 | 45–56    | 45–50   | 51–56   |
| N16            | 16 | 43–58    | 43–50   | 51–58   |
| N20            | 20 | 41–60    | 41–50   | 51–60   |

with A and B paying $10. `dean-neligh-exp1.2.json` runs experiment 1.2 alone. Both were
originally written in probability points with a $40 prize (and 25 points for experiment 1.4);
they now use the same dollar payoffs and one-student payment as the default.

## Files

```
index.html                         landing page (links to Task1/); states the payment scheme
Task1/index.html                   the experiment: reads the config, builds the instructions and
                                   questions from it, and writes the data file
Task1/configs/                     config files; dean-neligh-exp1.1-to-1.4-class.json is the default
Task1/jspsych-5.0/                 jsPsych 5.0 core and the plugins used, copied from Experiment 1
Task1/jspsych-5.0/plugins/jspsych-dots-choice.js   custom plugin: one dots question
```

There is no server code. The data file is built in the browser and downloaded at the end.

## Before running it in class

1. Choose the config file (`CONFIG_FILE` in `Task1/index.html`, or a `?config=` link).
2. Set `reps_per_treatment` in each experiment of the config. The default has 2: 18
   questions (9 × `reps_per_treatment` in general) plus 1 practice question.
3. Check the submission instructions on the end screen. Look for `SUBMISSION INSTRUCTIONS`
   in `Task1/index.html`; the deadline is currently December 5.
4. Check the time estimate on the landing page (`index.html`). It currently says
   approximately one hour.
5. Do a test run with a local server (see above).

## Hosting on GitHub Pages

Same as Experiment 1: push this repo to GitHub, then go to **Settings → Pages**, choose
**Deploy from a branch**, select `main` and `/ (root)`. Students go to
`https://<username>.github.io/econ-4850-exp2/`.

## Payment

Only one student is paid, in dollars. The students are told (landing page and a payment
instruction page) that after the deadline:

1. one student is selected at random from everyone who completed the experiment and submitted
   their data file, each with the same chance, and
2. one of that student's questions is selected at random, each with the same chance (practice
   questions are never selected),

and that the selected student is paid what their chosen option paid in that question. The
TA does the draw after the deadline:

1. Collect the uploaded files. If a UNI has more than one, use the one the student submitted
   (`session_start` tells attempts apart). Leave out incomplete files.
2. Pick one file at random.
3. In that file, pick one of the `main` rows at random. Its `payoff` is the payment, in dollars.

Doing the draw from the uploaded files, not in the browser, means a student cannot rerun the
experiment until a good question is drawn. Keep a record of the draw (e.g. the random seed
and the selected file and row) so it can be checked.

## The data file

At the end each student downloads one file, `<uni>_exp2.csv`. It has one row for each
practice question and one row for each main question, in the order they were answered.

| Column          | Meaning |
|-----------------|---------|
| `uni_code`      | UNI as typed, with everything but letters and digits removed and lowercased |
| `config`        | the config file used, e.g. `configs/dean-neligh-exp1.1-to-1.4-class.json` |
| `experiment`    | the experiment's `id` from the config file, e.g. `exp1.4` (`E1` if it has none); blank for the session's practice question |
| `part`          | the letter of the part as the student saw it, `A`, `B`, …: the position of that experiment in this student's session. `1` when the file has only one experiment; blank for the session's practice question |
| `phase`         | `practice` or `main` |
| `trial`         | 0 for a practice question, then 1, 2, … in order across the whole session |
| `block`         | position of the section within its part, in this student's order, 1, 2, … (blank for practice) |
| `treatment`     | the treatment's `id` from the config file (blank for practice) |
| `rep`           | question number within the section (blank for practice) |
| `n_red`         | number of red dots shown, i.e. the true state |
| `state`         | position of that state in the treatment's `states` list: 1 for the first, 2 for the second, … |
| `payoff_state`  | `id` of the payoff-relevant state that `n_red` belongs to, e.g. `low`; without `payoff_states` it is `n_red` |
| `choice`        | `label` of the action chosen |
| `correct`       | 1 if no other action pays more in the true state, else 0 |
| `payoff`        | what the chosen action pays in the true state, in dollars (this column was called `points` in earlier versions) |
| `rt`            | milliseconds from the question appearing to the click on Submit |
| `time_elapsed`  | milliseconds since the experiment started |
| `session_start` | when the student started (UTC), which tells repeat attempts by one UNI apart |
| `dot_layout`    | the 100 dots shown, row by row from the top left: `R` red, `B` blue |

## Quantities in the paper

All from the `main` rows. State 1 is the first state in `states` (49 red dots in experiments
1.1 and 1.2, 47 in experiment 1.3) and state 2 the second.

### Experiment 1.1

- Monotonicity (table 2): compare `P(b|2)`, the share of `choice == B` among rows with
  `state == 2`, in DP1 and DP2. Rational inattention allows, and the paper finds, `P(b|2)`
  rising when C is added (DP2), because C makes it worth finding out the state. The same
  comparison for `P(b|1)` should show little change. The paper's test is a logit of
  `choice == B` on a DP2 dummy, with standard errors clustered by student.
- NIAS and NIAC: appendix A1 of the paper.

### Experiment 1.2

For each DP *j*, with `R_j` from the table above, from the rows with `treatment == DPj`:

- `P_j(a|1)` is the share of `choice == A` among rows with `state == 1`, and `P_j(a|2)` is the
  same among rows with `state == 2`. Table 3 reports these.
- Accuracy is `(P_j(a|1) + P_j(b|2)) / 2`, the share of `correct == 1` when the states are
  balanced.
- NIAS: `P_j(a|1) > P_j(a|2)` in each DP.
- NIAC: accuracy does not decrease as R rises.
- Shannon (equation 2): with posteriors `γ_j^a(1) = P_j(a|1) / (P_j(a|1) + P_j(a|2))` and
  `γ_j^b(1) = P_j(b|1) / (P_j(b|1) + P_j(b|2))`, the implied cost is
  `κ_j = R_j / (ln γ_j^a(1) − ln γ_j^b(1))`, which should be the same in every DP. This
  treats dollars as utility (see above).

### Experiment 1.3

For each DP, with prior `μ(1)` = P(47 red dots):

- NIAS (equation 3): `P(a|1) ≥ ((2μ(1) − 1) / μ(1)) + ((1 − μ(1)) / μ(1)) · P(a|2)`.
- LIP: the posteriors after choosing A and B should be the same in every DP whose prior is
  inside the range of the posteriors used at `μ(1) = 0.5` (DP7). If the prior is outside it,
  the student should learn nothing and always choose A. Figure 4 of the paper.

### Experiment 1.4

From the rows with `experiment == exp1.4`:

- Figure 5: for each `n_red`, the share of `correct == 1`.
- Symmetry (invariance under compression): the Shannon model predicts that this share is
  the same at every `n_red` with the same `payoff_state`. The paper instead finds more
  mistakes near 50, from the logit regression (equation 7) of `correct` on
  `d = |n_red − 50|`, with standard errors clustered by student. Its estimate of the slope
  is 0.032 (p < .001).

With few questions per DP, individual-level estimates will be very noisy, and some cells will
be 0 or 1, in which case κ and the posteriors cannot be computed. Pool across the class.

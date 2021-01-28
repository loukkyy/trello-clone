import addGlobalEventListener from "./utils/addGlobalEventListener.js";
import setupDragAndDrop from "./dragAndDrop.js";
import { v4 as uuidV4 } from "uuid";

const STORAGE_PREFIX = "TRELLO_CLONE";
const LANE_STORAGE_KEY = `${STORAGE_PREFIX}-lanes`;
const DEFAULT_LANES = {
  backlog: [{ id: uuidV4(), text: "Create your first task" }],
  doing: [],
  done: [],
};
const trashDropZone = document.querySelector(".trash-drop-zone")
const lanesContainer = document.querySelector(".lanes");
const lanes = loadLanes();
Object.entries(lanes).forEach(renderLane);

setupDragAndDrop(onDrag, onDragComplete);

addGlobalEventListener("submit", "[data-task-form]", (e) => {
  e.preventDefault();
  const taskInput = e.target.querySelector("[data-task-input]");
  const taskText = taskInput.value;
  if (taskText === "") return;

  const task = { id: uuidV4(), text: taskText };
  const laneElement = e.target.closest(".lane").querySelector("[data-lane-id]");
  addTaskToLane(task, laneElement);
  taskInput.value = "";

  saveLanes();
});

function onDrag(e) {
  if (e.endZone.matches(".trash-drop-zone")) {
    trashDropZone.querySelector("i").classList.add("rise");
  } else {
    trashDropZone.querySelector("i").classList.remove("rise");
  }
}

function onDragComplete(e) {
  const startLaneId = e.startZone.dataset.laneId;
  const startLaneTasks = lanes[startLaneId];
  const task = startLaneTasks.find((t) => t.id === e.dragElement.id);
  startLaneTasks.splice(startLaneTasks.indexOf(task), 1);

  if (e.endZone.matches(".trash-drop-zone")) {
    e.dragElement.remove();
    trashDropZone.querySelector("i").classList.remove("rise");
  } else {
    const endLaneId = e.endZone.dataset.laneId;
    const endLaneTasks = lanes[endLaneId];
    endLaneTasks.splice(e.index, 0, task);
  }
  saveLanes();
}

function loadLanes() {
  const lanes = localStorage.getItem(LANE_STORAGE_KEY);
  return JSON.parse(lanes) || DEFAULT_LANES;
}

function saveLanes() {
  localStorage.setItem(LANE_STORAGE_KEY, JSON.stringify(lanes));
}

function addTaskToLane(task, laneElement) {
  lanes[laneElement.dataset.laneId].push(task);
  const taskElement = createTaskElement(task);
  laneElement.append(taskElement);
}

function createTaskElement(task) {
  const element = document.createElement("div");
  element.id = task.id;
  element.dataset.draggable = true;
  element.classList.add("task");
  element.innerText = task.text;
  return element;
}

function renderLane(lane) {
  const laneHeader = lane[0];
  const tasks = lane[1];
  const template = document.querySelector("#template-lanes");
  const laneClone = template.content.cloneNode(true);

  const header = laneClone.querySelector(".header");
  header.innerText = laneHeader;

  const tasksContainer = laneClone.querySelector(".tasks");
  tasks.forEach((task) => {
    const taskElement = createTaskElement(task);
    tasksContainer.append(taskElement);
  });
  tasksContainer.dataset.laneId = laneHeader;
  lanesContainer.append(laneClone);
}

const exportButton = document.querySelector("#export-button");
exportButton.addEventListener("click", exportTasks);
const importInput = document.querySelector("#import-input");
importInput.addEventListener("change", importTasks);

function exportTasks() {
  const blob = new Blob([JSON.stringify(lanes)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `data-tasks-${Date.now()}.json`;

  anchor.click();
  URL.revokeObjectURL(url);
}

function importTasks() {
  // read file
  const reader = new FileReader();
  reader.readAsText(this.files[0]);

  reader.addEventListener("load", (e) => {
    const importedTasks = JSON.parse(reader.result);

    Object.entries(importedTasks).forEach((entry) => {
      const laneId = entry[0];
      const lane = entry[1];
      lane.forEach((importedTask) => {
        const laneElement = document.querySelector(`[data-lane-id=${laneId}]`);
        const task = { id: uuidV4(), text: importedTask.text };
        addTaskToLane(task, laneElement);
      });
    });

    saveLanes();
  });
}

'use strict';


class Github {
    constructor() {
      this.clientId = 'c7a14a86ccac49ebd435';
      this.clientSecret = '260d65b6585133707988a5816c5fdd6b7c8a0f06';
    }
  
    async getUser(userName) {
        const data = await fetch(`https://api.github.com/users/${userName}?client_id=${this.clientId}&client_secret=${this.clientSecret}`);
        const profile = await data.json();
        return profile;
    }
  
    async getRepos(userName) {
        const data = await fetch(`https://api.github.com/users/${userName}/repos?client_id=${this.clientId}&client_secret=${this.clientSecret}`);
        const repos = await data.json();
        return repos;
    }
  
  }
  
  class UI {
    constructor() {
      this.profile = document.querySelector('.profile');
      this.repos = document.querySelector('.repos');
    }
  
    showProfile(user) {
      this.profile.innerHTML = `
        <div class="card card-body mb-3">
          <div class="row">
            <div class="col-md-3">
              <img class="img-fluid mb-2" src="${user.avatar_url}">
              <a href="${user.html_url}" target="_blank" class="btn btn-primary btn-block mb-4">View Profile</a>
            </div>
            <div class="col-md-9">
              <span class="badge badge-primary">Public Repos: ${user.public_repos}</span>
              <span class="badge badge-secondary">Public Gists: ${user.public_gists}</span>
              <span class="badge badge-success">Followers: ${user.followers}</span>
              <span class="badge badge-info">Following: ${user.following}</span>
              <br><br>
              <ul class="list-group">
                <li class="list-group-item">Company: ${user.company}</li>
                <li class="list-group-item">Website/Blog: ${user.blog}</li>
                <li class="list-group-item">Location: ${user.location}</li>
                <li class="list-group-item">Member Since: ${user.created_at}</li>
              </ul>
            </div>
          </div>
        </div>
        <h3 class="page-heading mb-3">Latest Repos</h3>
      
      `
    }
  
    showRepos(repos) {
      const ul = document.createElement('ul');
      this.repos.appendChild(ul);
      repos.sort((a, b) => a.created_at > b.created_at ? 1 : -1)
      const lastRepos = repos.slice(-5);
  
      lastRepos.map(repo => {
        const li = document.createElement('li');
        const a = document.createElement('a')
        ul.appendChild(li).appendChild(a);
        a.innerHTML = repo.full_name;
        a.setAttribute('href', repo.html_url);
        a.setAttribute('target', '_blank')
      })
    }
  
    showAlert(message, className) {
        this.clearAlert();

        const div = document.createElement('div');
        div.className = className;
        div.innerHTML = message;

        const search = document.querySelector('.search');
        search.before(div);

        setTimeout(() => {
            this.clearAlert()
        }, 3000)
    }

    clearAlert() {
        const alert = document.querySelector('.alert');
        if (alert) {
            alert.remove();
        }
    }

    clearProfile() {
        this.profile.innerHTML = '';
    }
  
    clearRepos() {
      this.repos.innerHTML = '';
    }
  }
  
  const github = new Github;
  const ui = new UI;
  
  const searchUser = document.querySelector('.searchUser');
  
  
  
  function debounce(func, timeout = 500) {
    let timer;
    return (e) => {
      clearTimeout(timer);
  
      timer = setTimeout(() => {
        func(e);
      }, timeout);
    };
  }
  
  function saveInput(e) {
    ui.clearRepos();
    const userText = e.target.value;
  
    if (userText.trim() !== '') {
      Promise.all([github.getUser(userText), github.getRepos(userText)]).then(([userData, reposData]) => {
        console.log(reposData)
        if (userData.message === 'Not Found') {
          ui.showAlert('User not found', 'alert alert-danger');
        } 
        if (userData.message !== 'Not Found'){
          ui.showProfile(userData)
        } 
        if (reposData.length === 0) {
          console.log('test')
          ui.showAlert('Repos not found', 'alert alert-danger');
        } 
        if (reposData.length > 0) {
          ui.showRepos(reposData)
        } 
      }, reason => {
        alert(reason.message);
      })
    } else {
      // очистити інпут пошуку
      ui.clearProfile();
    }
  
  }
  const processChange = debounce((event) => saveInput(event));
  
  searchUser.addEventListener('keyup', processChange)
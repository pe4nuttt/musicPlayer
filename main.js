const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const player = $('.player')
const cd = $('.cd');
const cdThumb = $('.cd-thumb')
const heading = $('header h2 marquee')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const volumeSet = $('#volumeAdjust')
const nextBtn = $('.control .btn-next')
const prevBtn = $('.control .btn-prev')
const randomBtn = $('.control .btn-random')
const repeatBtn = $('.control .btn-repeat')
const volumeBtn = $('.btn-volume')
const playlist = $('.playlist')

const PLAYER_STORAGE_KEY = 'PE4NUTTT_PLAYER'


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    isTimeUpdate : true,
    isMute: false,
    songVolume: 50,
    prevVolume: 50,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Bad Boy',
            singer: 'Big Bang',
            path: './assets/music/song1.mp3',
            image: './assets/img/song1.jpg'
        },
        {
            name: 'Next Level',
            singer: 'Aespa',
            path: './assets/music/song2.mp3',
            image: './assets/img/song2.jpg'
        },
        {
            name: 'Okeokeoke',
            singer: 'Low G',
            path: './assets/music/song3.mp3',
            image: './assets/img/song3.jpg'
        },
        {
            name: 'Trên tình bạn dưới tình yêu',
            singer: 'MIN',
            path: './assets/music/song4.mp3',
            image: './assets/img/song4.jpg'
        },
        {
            name: 'XTC',
            singer: 'Tlinh, Groovie Lã Thắng, MCK',
            path: './assets/music/song5.mp3',
            image: './assets/img/song5.jpg'
        },
        {
            name: 'An Thần',
            singer: 'Thắng, Low G',
            path: './assets/music/song6.mp3',
            image: './assets/img/song6.jpg'
        },
        {
            name: 'Love Scenario',
            singer: 'iKon',
            path: './assets/music/song7.mp3',
            image: './assets/img/song7.jpg'
        },
        {
            name: 'Lần Cuối',
            singer: 'Ngọt',
            path: './assets/music/song8.mp3',
            image: './assets/img/song8.jpg'
        },
        {
            name: 'Mặt Trời Của Em',
            singer: 'Phuong Ly, JustaTee',
            path: './assets/music/song9.mp3',
            image: './assets/img/song9.jpg'
        },
        {
            name: 'Bài Này Chill Phết',
            singer: 'Đen, Min',
            path: './assets/music/song10.mp3',
            image: './assets/img/song10.jpg'
        },
    ],
    randomList: [
    ],
    setConfig: function (key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb"
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `;
        });
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },
    createRandomList: function () {
        const length = this.songs.length
        for (var i = 0; i < length; i++) {
            this.randomList.push(i);
        }
    },
    handleEvents: function () {
        const _this = this
        const cdWidth = cd.offsetWidth

        // Xử lý CD rotate
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, // 10s
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xử lý khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause()
            }
            else {
                audio.play()
            }
        }

        // Khi song được play
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // Khi song bị pause
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration && _this.isTimeUpdate) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
                const color = `linear-gradient(90deg, var(--primary-color) ${progress.value}%, #d3d3d3 ${progress.value}%)`
                progress.style.background = color
            }
        }

        // Xử lý khi tua bài hát
        progress.onchange = function (e) {
            const seekTime = audio.duration * e.target.value / 100
            audio.currentTime = seekTime
        }

        progress.addEventListener('mousedown', function () {
            _this.isTimeUpdate = false;
        })

        progress.addEventListener('touchstart', function () {
            _this.isTimeUpdate = false;
        })

        progress.addEventListener('touchend', function () {
            _this.isTimeUpdate = true;
        })

        progress.addEventListener('mouseup', function () {
            _this.isTimeUpdate = true;
        })

        // Khi click next button
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi click prev button
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi click random button
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }


        // Xử lý next song khi audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // Xử lý click repeat button
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // Xử lý khi chỉnh Volume
        volumeSet.oninput = function(e) {
            _this.songVolume = e.target.value
            _this.prevVolume = _this.songVolume
            audio.volume = _this.songVolume / 100
            _this.loadVolumeRange()
            _this.volumeIconHandle()
        }

        // Xử lý khi click vào volume button
        volumeBtn.onclick = function() {
            _this.isMute = !_this.isMute
            if(_this.isMute) {
                audio.volume = 0
                _this.songVolume = 0
                _this.loadVolumeRange()
                volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>'
            } else {
                _this.songVolume = _this.prevVolume
                audio.volume = _this.songVolume / 100
                _this.loadVolumeRange()
                _this.volumeIconHandle()
            }
        }

        // Lắng nghe click vào playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            const songOption = e.target.closest('.song .option')
            if (songNode || songOption) {
                // Xử lý khi click vào song
                if (songNode) {
                    _this.currentIndex = parseInt(songNode.dataset.index)
                    _this.render()
                    _this.loadCurrentSong()
                    audio.play()
                }

                // Xử lý khi click vào song option
                if (songOption) {

                }

            }
        }
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'end',
            })
        }, 200)
    },
    loadCurrentSong: function () {
        if(this.currentSong) {
            heading.innerText = this.currentSong.name
            cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
            audio.src = this.currentSong.path
            this.setConfig('currentIndex', this.currentIndex)
        }
    },
    loadVolumeRange: function() {
        volumeSet.value = this.songVolume; 
        var volumeColor = `linear-gradient(90deg, var(--primary-color) ${this.songVolume}%, #d3d3d3 ${this.songVolume}%)`
        volumeSet.style.background = volumeColor
        // this.setConfig('songVolume', this.songVolume)
        this.volumeIconHandle()
    },
    volumeIconHandle: function() {
        const volume = this.songVolume;
        if(volume > 50) {
            volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>'
        } else {
            if(volume > 0 && volume <= 50) {
                volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>'
            } else {
                volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>'
            }
        }
    },
    loadConfig: function () {
        this.isRandom = this.config['isRandom']
        this.isRepeat = this.config['isRepeat']
        this.currentIndex = this.config.currentIndex || 0
        // this.songVolume = this.config.songVolume
        // audio.volume = this.songVolume / 100
        // this.prevVolume = this.songVolume
    },
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong()
    },
    playRandomSong: function () {
        if (this.randomList.length == 1) {
            this.randomList = this.songs.map((song, index) => index);
        }
        this.randomList = this.randomList.filter(item => item != this.currentIndex)
        let newIndex = this.randomList[Math.floor(Math.random() * this.randomList.length)]
        this.currentIndex = newIndex
        this.loadCurrentSong()

        // let newIndex = this.currentIndex;
        // do {
        //     newIndex = Math.floor(Math.random() * this.songs.length)
        // } while(newIndex === this.currentIndex)

        // this.currentIndex = newIndex
        // this.loadCurrentSong()
    },
    start: function () {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        // 
        this.loadVolumeRange();

        // Tạo mảng random list
        this.createRandomList();

        // Định nghĩa các thuộc tính cho object
        this.defineProperties();

        // Lắng nghe và xử lý các sự kiện (DOM Events)
        this.handleEvents();

        // Tải thông tin bài hát hiện tại vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        // Render playlist
        this.render();

        // Hiển thị trạng thái ban đầu của button repeat và random
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }

}

app.start();
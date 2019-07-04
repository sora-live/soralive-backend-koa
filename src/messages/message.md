roomchat json 协议

**command列表：**

| cmd | 命令 |
| --- | ---- |
| 1 | 加入房间 |
| 2 | 心跳包 |
| 3 | 评论信息 |


## Web端：

### 加入房间：

```json
{
    "token": "", // 已登录用户为登录token，未登录用户为空字符串
    "roomid": 2, // 房间对应的用户uid
    "cmd": 1
}
```

### 心跳包

```json
{
    "cmd": 2
}
```

### 发送评论

```json
{
    "cmd": 3,
    "comment": {
        "content": "评论内容"
    }
}
```

## 服务器

### 加入房间

```json
{
    "error": 0, // 0 - 加入成功， 1 - 加入失败
    "cmd": 1,
    "info": "info.success" // 服务器回复（失败原因）（成功时固定为info.success）
}
```

### 心跳包

```json
{
    "cmd": 2,
    "online": 15 // 在线人数
}
```

### 评论

```json
{
    "cmd": 3,
    "comment": {
        "uname": "用户名",
        "content": "评论内容"
    }
}
```
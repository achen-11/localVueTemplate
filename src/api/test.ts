// @k-url /api/test

k.api.post(()=>{
    const body = k.request.body
    return {
        success: true,
        data: body.name
    }
})
package app.affine.pro.service.interceptor

import android.webkit.CookieManager
import app.affine.pro.BuildConfig
import com.apollographql.apollo.api.http.HttpRequest
import com.apollographql.apollo.network.http.HttpInterceptor
import com.apollographql.apollo.network.http.HttpInterceptorChain

object CookieInterceptor : HttpInterceptor {
    override suspend fun intercept(
        request: HttpRequest,
        chain: HttpInterceptorChain
    ) = chain.proceed(
        request.newBuilder().addHeader(
            "Cookie", CookieManager.getInstance().getCookie(BuildConfig.BASE_URL)
        ).build()
    )
}